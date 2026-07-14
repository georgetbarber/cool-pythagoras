import { createContext, useContext, useEffect, useMemo, useReducer, useState } from "react";
import { CURRICULUM } from "./curriculum";
import { loadPersistedState, newSketch, savePersistedState } from "./repository";
import { mergeCloudSnapshot } from "./sync";
import type { CloudSnapshot } from "./sync";
import type { CompetencyEvidence, LearnerSettings, RouteId, Sketch, V8State } from "./types";

const ROUTES: RouteId[] = ["today", "path", "practice", "create", "explore"];
const BASELINE_UNITS: Record<LearnerSettings["startingBaseline"], string> = {
  repair: "unit-01",
  some: "unit-03",
  secure: "unit-07"
};

function routeFromLocation(): RouteId {
  const candidate = location.pathname.split("/").filter(Boolean)[0] as RouteId | undefined;
  return candidate && ROUTES.includes(candidate) ? candidate : "today";
}

export const DEFAULT_STATE: V8State = {
  version: 8,
  syncVersion: 1,
  updatedAt: "2026-07-13T00:00:00.000Z",
  settingsUpdatedAt: "2026-07-13T00:00:00.000Z",
  route: typeof location === "undefined" ? "today" : routeFromLocation(),
  activeUnitId: CURRICULUM[0].id,
  activeActivityId: null,
  resumeActivityId: null,
  completedActivityIds: [],
  evidence: [],
  settings: {
    instrument: "electric", dailyMinutes: 25, tonicName: "C", mode: "major", theme: "light",
    reducedMotion: false, diagnosticComplete: false, startingBaseline: "repair"
  },
  sketches: [], deletedSketchIds: {}, activeSketchId: null, lastReflection: ""
};

type Action =
  | { type: "hydrate"; state: V8State }
  | { type: "navigate"; route: RouteId; push?: boolean }
  | { type: "openUnit"; unitId: string }
  | { type: "openActivity"; activityId: string }
  | { type: "suspendActivity"; route: RouteId }
  | { type: "resumeActivity" }
  | { type: "recordActivity"; activityId: string; evidence: CompetencyEvidence[]; reflection?: string }
  | { type: "updateSettings"; settings: Partial<LearnerSettings> }
  | { type: "createSketch" }
  | { type: "updateSketch"; sketch: Sketch }
  | { type: "deleteSketch"; id: string }
  | { type: "clearRecordings" }
  | { type: "setActiveSketch"; id: string }
  | { type: "mergeCloud"; snapshot: CloudSnapshot }
  | { type: "replaceState"; state: V8State };

function reducer(state: V8State, action: Action): V8State {
  const changedAt = new Date().toISOString();
  switch (action.type) {
    case "hydrate": return { ...DEFAULT_STATE, ...action.state, deletedSketchIds: action.state.deletedSketchIds ?? {}, route: routeFromLocation() };
    case "replaceState": return { ...DEFAULT_STATE, ...action.state, deletedSketchIds: action.state.deletedSketchIds ?? {}, route: routeFromLocation(), updatedAt: changedAt };
    case "mergeCloud": return mergeCloudSnapshot(state, action.snapshot);
    case "navigate": return { ...state, route: action.route, activeActivityId: null };
    case "openUnit": return { ...state, route: "path", activeUnitId: action.unitId, activeActivityId: null, updatedAt: changedAt };
    case "openActivity": return { ...state, activeActivityId: action.activityId };
    case "suspendActivity": return { ...state, route: action.route, resumeActivityId: state.activeActivityId, activeActivityId: null };
    case "resumeActivity": return { ...state, activeActivityId: state.resumeActivityId, resumeActivityId: null };
    case "recordActivity": return {
      ...state,
      // activeActivityId is intentionally kept so the player can show a completion
      // panel with a "continue to next" action; the player closes itself explicitly.
      resumeActivityId: null,
      completedActivityIds: [...new Set([...state.completedActivityIds, action.activityId])],
      evidence: [...state.evidence, ...action.evidence],
      lastReflection: action.reflection || state.lastReflection,
      updatedAt: changedAt
    };
    case "updateSettings": {
      const settings = { ...state.settings, ...action.settings };
      return {
        ...state,
        settings,
        activeUnitId: action.settings.diagnosticComplete && action.settings.startingBaseline
          ? BASELINE_UNITS[action.settings.startingBaseline]
          : state.activeUnitId,
        settingsUpdatedAt: changedAt,
        updatedAt: changedAt
      };
    }
    case "createSketch": {
      const sketch = newSketch(state.sketches.length);
      return { ...state, sketches: [...state.sketches, sketch], activeSketchId: sketch.id, route: "create", updatedAt: changedAt };
    }
    case "updateSketch": return {
      ...state,
      sketches: state.sketches.map((sketch) => sketch.id === action.sketch.id ? action.sketch : sketch),
      activeSketchId: action.sketch.id,
      updatedAt: changedAt
    };
    case "deleteSketch": return {
      ...state,
      sketches: state.sketches.filter((sketch) => sketch.id !== action.id),
      deletedSketchIds: { ...state.deletedSketchIds, [action.id]: changedAt },
      activeSketchId: state.activeSketchId === action.id ? null : state.activeSketchId,
      updatedAt: changedAt
    };
    case "clearRecordings": return {
      ...state,
      sketches: state.sketches.map((sketch) => sketch.takes.length ? { ...sketch, takes: [], updatedAt: changedAt } : sketch),
      updatedAt: changedAt
    };
    case "setActiveSketch": return { ...state, activeSketchId: action.id, route: "create" };
  }
}

interface StoreValue { state: V8State; dispatch: React.Dispatch<Action>; hydrated: boolean }
const Store = createContext<StoreValue | null>(null);

export function V8StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, DEFAULT_STATE);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    void loadPersistedState().then((persisted) => {
      if (persisted?.version === 8) dispatch({ type: "hydrate", state: persisted });
      setHydrated(true);
    });
  }, []);
  useEffect(() => {
    if (!hydrated) return;
    document.documentElement.dataset.theme = state.settings.theme;
    document.documentElement.dataset.motion = state.settings.reducedMotion ? "reduced" : "full";
    void savePersistedState(state).catch(() => undefined);
  }, [state, hydrated]);
  useEffect(() => {
    const listener = () => dispatch({ type: "navigate", route: routeFromLocation() });
    addEventListener("popstate", listener);
    return () => removeEventListener("popstate", listener);
  }, []);
  const value = useMemo(() => ({ state, dispatch, hydrated }), [state, hydrated]);
  return <Store.Provider value={value}>{children}</Store.Provider>;
}

export function useV8Store() {
  const value = useContext(Store);
  if (!value) throw new Error("useV8Store must be used inside V8StoreProvider");
  const navigate = (route: RouteId) => {
    history.pushState({}, "", `/${route}`);
    value.dispatch({ type: "navigate", route });
  };
  return { ...value, navigate };
}
