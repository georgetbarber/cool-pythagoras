import { useEffect, useReducer } from "react";
import { pitch } from "../domain/music";
import type {
  Depth,
  LabelMode,
  ModeId,
  PitchClass,
  TonalContext,
  WorkspaceId
} from "../domain/types";

export interface AppState {
  workspace: WorkspaceId;
  depth: Depth;
  context: TonalContext;
  selectedPitchClass: PitchClass;
  activeChordDegree: number;
  activeVoicingIndex: number;
  seventhChords: boolean;
  labelMode: LabelMode;
  showScale: boolean;
  showChord: boolean;
  showRoots: boolean;
  completedConcepts: string[];
  theme: "dark" | "light";
}

export type AppAction =
  | { type: "patch"; patch: Partial<AppState> }
  | { type: "setContext"; tonic: string; mode: ModeId }
  | { type: "completeConcept"; id: string }
  | { type: "resetProgress" };

const STORAGE_KEY = "guitar-academy-v3-state";
const SCHEMA_VERSION = 1;

const DEFAULT_STATE: AppState = {
  workspace: "learn",
  depth: "essential",
  context: { tonic: pitch("C"), mode: "major" },
  selectedPitchClass: 0,
  activeChordDegree: 1,
  activeVoicingIndex: 0,
  seventhChords: false,
  labelMode: "degree",
  showScale: true,
  showChord: true,
  showRoots: true,
  completedConcepts: [],
  theme: "dark"
};

function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw) as { version?: number; state?: Partial<AppState> };
    if (parsed.version !== SCHEMA_VERSION || !parsed.state) return DEFAULT_STATE;
    return {
      ...DEFAULT_STATE,
      ...parsed.state,
      context: {
        ...DEFAULT_STATE.context,
        ...parsed.state.context,
        tonic: parsed.state.context?.tonic
          ? pitch(parsed.state.context.tonic.name)
          : DEFAULT_STATE.context.tonic
      }
    };
  } catch {
    return DEFAULT_STATE;
  }
}

function reducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "patch":
      return { ...state, ...action.patch };
    case "setContext": {
      const tonic = pitch(action.tonic);
      return {
        ...state,
        context: { tonic, mode: action.mode },
        selectedPitchClass: tonic.pitchClass,
        activeChordDegree: 1,
        activeVoicingIndex: 0
      };
    }
    case "completeConcept":
      return state.completedConcepts.includes(action.id)
        ? state
        : {
            ...state,
            completedConcepts: [...state.completedConcepts, action.id]
          };
    case "resetProgress":
      return { ...state, completedConcepts: [] };
  }
}

export function useAppStore() {
  const [state, dispatch] = useReducer(reducer, undefined, loadState);
  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ version: SCHEMA_VERSION, state })
    );
    document.documentElement.dataset.theme = state.theme;
  }, [state]);
  return { state, dispatch };
}
