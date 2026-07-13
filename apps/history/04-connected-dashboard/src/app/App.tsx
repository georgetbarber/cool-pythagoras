import { useAppModel } from "../application/model";
import { useAppStore } from "../application/store";
import { ContextBar } from "../components/ContextBar";
import type { WorkspaceId } from "../domain/types";
import { Dashboard } from "../features/Dashboard";
import {
  AdvancedWorkspace,
  EarWorkspace,
  ExploreWorkspace,
  FretboardWorkspace,
  HarmonyWorkspace,
  LearnWorkspace,
  PracticeWorkspace,
  ProgressionsWorkspace
} from "../features/Workspaces";

const NAV: Array<{ id: WorkspaceId; label: string; short: string }> = [
  { id: "dashboard", label: "Dashboard", short: "00" },
  { id: "learn", label: "Learn", short: "01" },
  { id: "explore", label: "Explore", short: "02" },
  { id: "fretboard", label: "Fretboard", short: "03" },
  { id: "harmony", label: "Harmony", short: "04" },
  { id: "progressions", label: "Progressions", short: "05" },
  { id: "ear", label: "Ear", short: "06" },
  { id: "practice", label: "Practice", short: "07" },
  { id: "advanced", label: "Advanced", short: "08" }
];

export function App() {
  const { state, dispatch } = useAppStore();
  const model = useAppModel(state);
  const props = { state, dispatch, model };
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <button className="brand" onClick={() => dispatch({ type: "setWorkspace", workspace: "dashboard" })}>
          <span>GA</span><div><strong>Guitar Academy</strong><small>Relationship system · V4</small></div>
        </button>
        <nav aria-label="Learning workspaces">
          {NAV.map((item) => (
            <button
              className={state.workspace === item.id ? "is-active" : ""}
              aria-current={state.workspace === item.id ? "page" : undefined}
              onClick={() => dispatch({ type: "setWorkspace", workspace: item.id })}
              key={item.id}
            >
              <span>{item.short}</span><strong>{item.label}</strong>
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div><span>Depth</span><strong>{state.depth}</strong></div>
          <button onClick={() => dispatch({ type: "toggleTheme" })}>{state.theme === "light" ? "Dark interface" : "Light interface"}</button>
        </div>
      </aside>
      <main>
        <ContextBar state={state} dispatch={dispatch} />
        <div className="workspace">
          {state.workspace === "dashboard" && <Dashboard {...props} />}
          {state.workspace === "learn" && <LearnWorkspace {...props} />}
          {state.workspace === "explore" && <ExploreWorkspace {...props} />}
          {state.workspace === "fretboard" && <FretboardWorkspace {...props} />}
          {state.workspace === "harmony" && <HarmonyWorkspace {...props} />}
          {state.workspace === "progressions" && <ProgressionsWorkspace {...props} />}
          {state.workspace === "ear" && <EarWorkspace {...props} />}
          {state.workspace === "practice" && <PracticeWorkspace {...props} />}
          {state.workspace === "advanced" && <AdvancedWorkspace {...props} />}
        </div>
      </main>
    </div>
  );
}

