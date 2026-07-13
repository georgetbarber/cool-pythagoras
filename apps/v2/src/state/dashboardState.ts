import { useEffect, useReducer } from "react";
import type {
  CagedShape,
  ChordQuality,
  KeySelection,
  PitchClass,
  ViewId,
  VoicingMode
} from "../domain/types";

export interface DashboardState {
  view: ViewId;
  key: KeySelection;
  activeRootPc: PitchClass;
  activeRootName: string;
  activeQuality: ChordQuality;
  seventhChords: boolean;
  showExtended: boolean;
  showChromatic: boolean;
  showScale: boolean;
  pentatonicOnly: boolean;
  tuningId: string;
  voicingMode: VoicingMode;
  cagedShape: CagedShape;
  theme: "dark" | "light";
  completedLessons: string[];
}

type Action =
  | { type: "patch"; patch: Partial<DashboardState> }
  | { type: "setKey"; key: KeySelection }
  | {
      type: "selectChord";
      rootPc: PitchClass;
      rootName: string;
      quality: ChordQuality;
    }
  | { type: "completeLesson"; lessonId: string };

const STORAGE_KEY = "guitar-academy-dashboard-v2";

const DEFAULT_STATE: DashboardState = {
  view: "explorer",
  key: { tonic: "C", tonicPc: 0, mode: "major" },
  activeRootPc: 0,
  activeRootName: "C",
  activeQuality: "Major",
  seventhChords: false,
  showExtended: false,
  showChromatic: false,
  showScale: true,
  pentatonicOnly: false,
  tuningId: "standard",
  voicingMode: "compact",
  cagedShape: "off",
  theme: "dark",
  completedLessons: []
};

function loadState(): DashboardState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? { ...DEFAULT_STATE, ...JSON.parse(stored) } : DEFAULT_STATE;
  } catch {
    return DEFAULT_STATE;
  }
}

function reducer(state: DashboardState, action: Action): DashboardState {
  switch (action.type) {
    case "patch":
      return { ...state, ...action.patch };
    case "setKey":
      return {
        ...state,
        key: action.key,
        activeRootPc: action.key.tonicPc,
        activeRootName: action.key.tonic,
        activeQuality:
          action.key.mode === "major" ||
          action.key.mode === "lydian" ||
          action.key.mode === "mixolydian"
            ? "Major"
            : "Minor"
      };
    case "selectChord":
      return {
        ...state,
        activeRootPc: action.rootPc,
        activeRootName: action.rootName,
        activeQuality: action.quality
      };
    case "completeLesson":
      return state.completedLessons.includes(action.lessonId)
        ? state
        : {
            ...state,
            completedLessons: [...state.completedLessons, action.lessonId]
          };
  }
}

export function useDashboardState() {
  const [state, dispatch] = useReducer(reducer, undefined, loadState);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    document.documentElement.dataset.theme = state.theme;
  }, [state]);

  return { state, dispatch };
}
