import { useAppStore } from "../application/store";
import type { RouteId } from "../application/store";
import { ContextBar } from "../components/ContextBar";
import { Dashboard } from "../features/Dashboard";
import { Ear } from "../features/Ear";
import { Explore } from "../features/Explore";
import { FretboardLab } from "../features/FretboardLab";
import { Harmony } from "../features/Harmony";
import { Learn } from "../features/Learn";
import { PlayAlong } from "../features/PlayAlong";
import { PlayLab } from "../features/PlayLab";
import { Practice } from "../features/Practice";
import { Profile } from "../features/Profile";
import { Progressions } from "../features/Progressions";

const NAV: Array<{ id: RouteId; label: string; purpose: string }> = [
  { id: "dashboard", label: "Dashboard", purpose: "Orient" },
  { id: "learn", label: "Learn", purpose: "Understand" },
  { id: "explore", label: "Explore", purpose: "Relate" },
  { id: "fretboard", label: "Fretboard", purpose: "Map" },
  { id: "harmony", label: "Harmony", purpose: "Build" },
  { id: "progressions", label: "Progressions", purpose: "Move" },
  { id: "ear", label: "Ear", purpose: "Hear" },
  { id: "practice", label: "Practice", purpose: "Retrieve" },
  { id: "lab", label: "Play Lab", purpose: "Discover" },
  { id: "play", label: "Play Along", purpose: "Apply" },
  { id: "profile", label: "My Path", purpose: "Personalise" }
];

export function App() {
  const { state, dispatch, model } = useAppStore();
  const props = { state, dispatch, model };
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <button className="brand" onClick={() => dispatch({ type: "navigate", route: "dashboard" })}>
          <span>GA</span>
          <div><strong>Guitar Academy</strong><small>Relationship learning · V6</small></div>
        </button>
        <nav aria-label="Learning workspaces">
          {NAV.map((item, index) => (
            <button
              className={state.route === item.id ? "is-active" : ""}
              aria-current={state.route === item.id ? "page" : undefined}
              onClick={() => dispatch({ type: "navigate", route: item.id })}
              key={item.id}
            >
              <span>{String(index).padStart(2, "0")}</span>
              <div><strong>{item.label}</strong><small>{item.purpose}</small></div>
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div><span>Daily plan</span><strong>{state.profile.dailyMinutes} min</strong></div>
          <div><span>Lessons</span><strong>{state.learning.completedLessons.length}</strong></div>
          <button onClick={() => dispatch({ type: "toggleTheme" })}>
            {state.theme === "light" ? "Use dark theme" : "Use light theme"}
          </button>
        </div>
      </aside>
      <main>
        <ContextBar {...props} />
        <div className="workspace">
          {state.route === "dashboard" && <Dashboard {...props} />}
          {state.route === "learn" && <Learn {...props} />}
          {state.route === "explore" && <Explore {...props} />}
          {state.route === "fretboard" && <FretboardLab {...props} />}
          {state.route === "harmony" && <Harmony {...props} />}
          {state.route === "progressions" && <Progressions {...props} />}
          {state.route === "ear" && <Ear {...props} />}
          {state.route === "practice" && <Practice {...props} />}
          {state.route === "lab" && <PlayLab {...props} />}
          {state.route === "play" && <PlayAlong {...props} />}
          {state.route === "profile" && <Profile {...props} />}
        </div>
      </main>
    </div>
  );
}
