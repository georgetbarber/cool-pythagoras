import { useEffect, useReducer } from "react";
import { MODE_IDS, ROOT_NAMES, pitch } from "../domain/music";
import type {
  Depth,
  Chord,
  LabelMode,
  ModeId,
  PitchClass,
  StringPolicy,
  TonalContext,
  WorkspaceId
} from "../domain/types";

export interface LayerState {
  scale: boolean;
  chord: boolean;
  tonic: boolean;
  voicing: boolean;
  selection: boolean;
}

export interface Attempt {
  id: string;
  skill: string;
  context: string;
  correct: boolean;
  answeredAt: string;
}

export interface AppState {
  workspace: WorkspaceId;
  depth: Depth;
  context: TonalContext;
  sevenths: boolean;
  activeChordDegree: number;
  focusedChord: Chord | null;
  selectedPitchClass: PitchClass;
  selectedPosition: { string: number; fret: number } | null;
  intervalRoot: { string: number; fret: number; pitchClass: PitchClass } | null;
  selectedInterval: number;
  activeVoicingIndex: number;
  stringPolicy: StringPolicy;
  labelMode: LabelMode;
  layers: LayerState;
  progressionId: string;
  progressionStep: number;
  theme: "light" | "dark";
  attempts: Attempt[];
}

export type AppCommand =
  | { type: "setWorkspace"; workspace: WorkspaceId }
  | { type: "setTonalContext"; tonic: string; mode: ModeId }
  | { type: "focusChord"; degree: number }
  | { type: "focusExternalChord"; chord: Chord }
  | { type: "focusPitch"; pitchClass: PitchClass }
  | { type: "focusPosition"; string: number; fret: number; pitchClass: PitchClass }
  | { type: "setIntervalRoot"; string: number; fret: number; pitchClass: PitchClass }
  | { type: "setSelectedInterval"; semitones: number }
  | { type: "focusVoicing"; index: number }
  | { type: "selectProgressionStep"; index: number; degree: number }
  | { type: "setDepth"; depth: Depth }
  | { type: "setSevenths"; value: boolean }
  | { type: "setStringPolicy"; policy: StringPolicy }
  | { type: "setLabelMode"; mode: LabelMode }
  | { type: "toggleLayer"; layer: keyof LayerState }
  | { type: "setProgression"; id: string }
  | { type: "toggleTheme" }
  | { type: "recordAttempt"; attempt: Attempt };

const STORAGE_KEY = "guitar-academy-v4";
const VERSION = 2;

export const DEFAULT_STATE: AppState = {
  workspace: "dashboard",
  depth: "essential",
  context: { tonic: pitch("C"), mode: "major" },
  sevenths: false,
  activeChordDegree: 1,
  focusedChord: null,
  selectedPitchClass: 0,
  selectedPosition: null,
  intervalRoot: { string: 5, fret: 8, pitchClass: 0 },
  selectedInterval: 7,
  activeVoicingIndex: 0,
  stringPolicy: "auto",
  labelMode: "combined",
  layers: { scale: true, chord: true, tonic: true, voicing: true, selection: true },
  progressionId: "one-four-five",
  progressionStep: 0,
  theme: "light",
  attempts: []
};

const WORKSPACES: WorkspaceId[] = ["dashboard", "learn", "explore", "fretboard", "harmony", "progressions", "ear", "practice", "advanced"];
const DEPTHS: Depth[] = ["essential", "expanded", "advanced"];
const LABELS: LabelMode[] = ["degree", "chord", "note", "combined"];

function isPolicy(value: unknown): value is StringPolicy {
  return value === "auto" || [3, 4, 5, 6].includes(value as number);
}

function load(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw) as { version?: number; state?: Partial<AppState> };
    const state = parsed.state;
    if (parsed.version !== VERSION || !state) return DEFAULT_STATE;
    const tonicName = state.context?.tonic?.name;
    const mode = state.context?.mode;
    if (!tonicName || !ROOT_NAMES.includes(tonicName as (typeof ROOT_NAMES)[number]) || !mode || !MODE_IDS.includes(mode)) {
      return DEFAULT_STATE;
    }
    return {
      ...DEFAULT_STATE,
      ...state,
      workspace: WORKSPACES.includes(state.workspace as WorkspaceId) ? state.workspace! : DEFAULT_STATE.workspace,
      depth: DEPTHS.includes(state.depth as Depth) ? state.depth! : DEFAULT_STATE.depth,
      labelMode: LABELS.includes(state.labelMode as LabelMode) ? state.labelMode! : DEFAULT_STATE.labelMode,
      stringPolicy: isPolicy(state.stringPolicy) ? state.stringPolicy : DEFAULT_STATE.stringPolicy,
      context: { tonic: pitch(tonicName), mode },
      layers: { ...DEFAULT_STATE.layers, ...state.layers },
      focusedChord: null,
      attempts: Array.isArray(state.attempts) ? state.attempts.slice(-200) : []
    };
  } catch {
    return DEFAULT_STATE;
  }
}

export function appReducer(state: AppState, command: AppCommand): AppState {
  switch (command.type) {
    case "setWorkspace":
      return { ...state, workspace: command.workspace };
    case "setTonalContext": {
      const tonic = pitch(command.tonic);
      return {
        ...state,
        context: { tonic, mode: command.mode },
      activeChordDegree: 1,
        focusedChord: null,
        selectedPitchClass: tonic.pitchClass,
        selectedPosition: null,
        intervalRoot: null,
        activeVoicingIndex: 0,
        progressionStep: 0
      };
    }
    case "focusChord":
      return {
        ...state,
        activeChordDegree: command.degree,
        focusedChord: null,
        selectedPosition: null,
        activeVoicingIndex: 0
      };
    case "focusExternalChord":
      return {
        ...state,
        focusedChord: command.chord,
        activeChordDegree: command.chord.degree,
        selectedPitchClass: command.chord.root.pitchClass,
        selectedPosition: null,
        activeVoicingIndex: 0
      };
    case "focusPitch":
      return { ...state, selectedPitchClass: command.pitchClass, selectedPosition: null };
    case "focusPosition":
      return {
        ...state,
        selectedPitchClass: command.pitchClass,
        selectedPosition: { string: command.string, fret: command.fret }
      };
    case "setIntervalRoot":
      return {
        ...state,
        intervalRoot: {
          string: command.string,
          fret: command.fret,
          pitchClass: command.pitchClass
        },
        selectedPitchClass: command.pitchClass,
        selectedPosition: { string: command.string, fret: command.fret }
      };
    case "setSelectedInterval":
      return { ...state, selectedInterval: ((command.semitones % 12) + 12) % 12 };
    case "focusVoicing":
      return { ...state, activeVoicingIndex: command.index };
    case "selectProgressionStep":
      return {
        ...state,
        progressionStep: command.index,
        activeChordDegree: command.degree,
        focusedChord: null,
        activeVoicingIndex: 0
      };
    case "setDepth":
      return { ...state, depth: command.depth };
    case "setSevenths":
      return { ...state, sevenths: command.value, activeVoicingIndex: 0 };
    case "setStringPolicy":
      return { ...state, stringPolicy: command.policy, activeVoicingIndex: 0 };
    case "setLabelMode":
      return { ...state, labelMode: command.mode };
    case "toggleLayer":
      return { ...state, layers: { ...state.layers, [command.layer]: !state.layers[command.layer] } };
    case "setProgression":
      return {
        ...state,
        progressionId: command.id,
        progressionStep: 0,
        focusedChord: null
      };
    case "toggleTheme":
      return { ...state, theme: state.theme === "light" ? "dark" : "light" };
    case "recordAttempt":
      return { ...state, attempts: [...state.attempts, command.attempt].slice(-200) };
  }
}

export function useAppStore() {
  const [state, dispatch] = useReducer(appReducer, undefined, load);
  useEffect(() => {
    document.documentElement.dataset.theme = state.theme;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: VERSION, state }));
    } catch {
      // The app remains usable when storage is unavailable.
    }
  }, [state]);
  return { state, dispatch };
}
