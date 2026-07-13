import { useEffect, useMemo, useReducer } from "react";
import { buildChords, buildScale, createContext, MODES, ROOTS } from "../core/music/theory";
import type { ModeId, PitchClass, TonalContext } from "../core/music/types";
import type { LearnerProfile, LearningRecord } from "../learning/types";
import { DEFAULT_PROFILE, EMPTY_RECORD, recordEvidence } from "../learning/engine";

export type RouteId =
  | "dashboard"
  | "learn"
  | "explore"
  | "fretboard"
  | "harmony"
  | "progressions"
  | "ear"
  | "practice"
  | "play"
  | "profile";

export interface AppState {
  route: RouteId;
  context: TonalContext;
  selectedPitch: PitchClass;
  selectedChordDegree: number;
  selectedInterval: number;
  selectedPosition: { string: number; fret: number } | null;
  progressionId: string;
  sevenths: boolean;
  labelMode: "relationships" | "notes";
  theme: "light" | "dark";
  profile: LearnerProfile;
  learning: LearningRecord;
}

export type AppAction =
  | { type: "navigate"; route: RouteId }
  | { type: "setContext"; tonicName: string; mode: ModeId }
  | { type: "selectPitch"; pitchClass: PitchClass }
  | { type: "selectChord"; degree: number }
  | { type: "selectInterval"; semitones: number }
  | { type: "selectPosition"; string: number; fret: number; pitchClass: PitchClass }
  | { type: "setProgression"; id: string }
  | { type: "toggleSevenths" }
  | { type: "setLabelMode"; mode: AppState["labelMode"] }
  | { type: "toggleTheme" }
  | { type: "updateProfile"; profile: LearnerProfile }
  | { type: "startLesson"; id: string }
  | { type: "cancelLesson" }
  | { type: "setLessonStep"; step: number }
  | { type: "completeLesson"; id: string; minutes: number }
  | { type: "recordExercise"; skill: string; correct: boolean };

const STORAGE_KEY = "guitar-academy-v5";
const STORAGE_VERSION = 1;

export const DEFAULT_STATE: AppState = {
  route: "dashboard",
  context: createContext(),
  selectedPitch: 0,
  selectedChordDegree: 1,
  selectedInterval: 7,
  selectedPosition: null,
  progressionId: "one-four-five",
  sevenths: false,
  labelMode: "relationships",
  theme: "light",
  profile: DEFAULT_PROFILE,
  learning: EMPTY_RECORD
};

const ROUTES: RouteId[] = [
  "dashboard", "learn", "explore", "fretboard", "harmony",
  "progressions", "ear", "practice", "play", "profile"
];

function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw) as { version?: number; state?: Partial<AppState> };
    if (parsed.version !== STORAGE_VERSION || !parsed.state) return DEFAULT_STATE;
    const state = parsed.state;
    const contextCandidate = state.context;
    const validRoot = ROOTS.some(([name]) => name === contextCandidate?.tonicName);
    const validMode = Boolean(contextCandidate?.mode && contextCandidate.mode in MODES);
    const context = contextCandidate && validRoot && validMode
      ? createContext(contextCandidate.tonicName, contextCandidate.mode)
      : DEFAULT_STATE.context;
    return {
      ...DEFAULT_STATE,
      ...state,
      route: ROUTES.includes(state.route as RouteId) ? state.route! : "dashboard",
      context,
      profile: { ...DEFAULT_PROFILE, ...state.profile },
      learning: {
        ...EMPTY_RECORD,
        ...state.learning,
        skills: state.learning?.skills ?? {},
        completedLessons: Array.isArray(state.learning?.completedLessons)
          ? state.learning.completedLessons
          : []
      }
    };
  } catch {
    return DEFAULT_STATE;
  }
}

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "navigate":
      return { ...state, route: action.route };
    case "setContext": {
      const context = createContext(action.tonicName, action.mode);
      return {
        ...state,
        context,
        selectedPitch: context.tonic,
        selectedChordDegree: 1,
        selectedPosition: null
      };
    }
    case "selectPitch":
      return { ...state, selectedPitch: action.pitchClass, selectedPosition: null };
    case "selectChord":
      return { ...state, selectedChordDegree: action.degree };
    case "selectInterval":
      return { ...state, selectedInterval: action.semitones };
    case "selectPosition":
      return {
        ...state,
        selectedPitch: action.pitchClass,
        selectedPosition: { string: action.string, fret: action.fret }
      };
    case "setProgression":
      return { ...state, progressionId: action.id };
    case "toggleSevenths":
      return { ...state, sevenths: !state.sevenths };
    case "setLabelMode":
      return { ...state, labelMode: action.mode };
    case "toggleTheme":
      return { ...state, theme: state.theme === "light" ? "dark" : "light" };
    case "updateProfile":
      return { ...state, profile: action.profile };
    case "startLesson":
      return {
        ...state,
        route: "learn",
        learning: { ...state.learning, currentLessonId: action.id, currentLessonStep: 0 }
      };
    case "cancelLesson":
      return {
        ...state,
        learning: { ...state.learning, currentLessonId: null, currentLessonStep: 0 }
      };
    case "setLessonStep":
      return { ...state, learning: { ...state.learning, currentLessonStep: action.step } };
    case "completeLesson":
      return {
        ...state,
        learning: {
          ...state.learning,
          currentLessonId: null,
          currentLessonStep: 0,
          completedLessons: [...new Set([...state.learning.completedLessons, action.id])],
          totalPracticeMinutes: state.learning.totalPracticeMinutes + action.minutes
        }
      };
    case "recordExercise":
      return { ...state, learning: recordEvidence(state.learning, action.skill, action.correct) };
  }
}

export function useAppStore() {
  const [state, dispatch] = useReducer(appReducer, undefined, loadState);
  const model = useMemo(() => {
    const scale = buildScale(state.context);
    const chords = buildChords(state.context, state.sevenths);
    const activeChord = chords.find((chord) => chord.degree === state.selectedChordDegree) ?? chords[0];
    return { scale, chords, activeChord };
  }, [state.context, state.selectedChordDegree, state.sevenths]);

  useEffect(() => {
    document.documentElement.dataset.theme = state.theme;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: STORAGE_VERSION, state }));
    } catch {
      // Persistence is optional; the learning tools remain usable without it.
    }
  }, [state]);

  return { state, dispatch, model };
}
