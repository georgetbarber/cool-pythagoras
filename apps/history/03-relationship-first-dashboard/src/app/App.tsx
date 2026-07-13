import { useMemo } from "react";
import { ContextBar } from "../components/ContextBar";
import {
  analyzePitch,
  buildDiatonicChords,
  buildScale
} from "../domain/music";
import type { WorkspaceId } from "../domain/types";
import { Advanced } from "../features/Advanced";
import { Ear } from "../features/Ear";
import { Explore } from "../features/Explore";
import { FretboardLab } from "../features/FretboardLab";
import { Harmony } from "../features/Harmony";
import { Learn } from "../features/Learn";
import { Practice } from "../features/Practice";
import { Progressions } from "../features/Progressions";
import type { WorkspaceProps } from "../features/types";
import { generateVoicings } from "../guitar/model";
import { useAppStore } from "../state/store";

const NAVIGATION: Array<{
  id: WorkspaceId;
  label: string;
  short: string;
  description: string;
}> = [
  { id: "learn", label: "Learn", short: "01", description: "Guided pathways" },
  { id: "explore", label: "Explore", short: "02", description: "Context and roles" },
  { id: "fretboard", label: "Fretboard", short: "03", description: "Shapes and geography" },
  { id: "harmony", label: "Harmony", short: "04", description: "Chords and function" },
  { id: "progressions", label: "Progressions", short: "05", description: "Movement and cadence" },
  { id: "ear", label: "Ear", short: "06", description: "Contextual hearing" },
  { id: "practice", label: "Practice", short: "07", description: "Adaptive retrieval" },
  { id: "advanced", label: "Advanced", short: "08", description: "Reinterpretation" }
];

export function App() {
  const { state, dispatch } = useAppStore();
  const scale = useMemo(() => buildScale(state.context), [state.context]);
  const chords = useMemo(
    () => buildDiatonicChords(state.context, state.seventhChords),
    [state.context, state.seventhChords]
  );
  const activeChord =
    chords.find((chord) => chord.degree === state.activeChordDegree) ?? chords[0];
  const voicings = useMemo(
    () => generateVoicings(activeChord, { limit: 16, maxSpan: 4 }),
    [activeChord]
  );
  const activeVoicing =
    voicings[state.activeVoicingIndex % Math.max(1, voicings.length)] ?? null;
  const analysis = useMemo(
    () => analyzePitch(state.context, state.selectedPitchClass, activeChord),
    [state.context, state.selectedPitchClass, activeChord]
  );
  const workspaceProps: WorkspaceProps = {
    state,
    dispatch,
    scale,
    chords,
    activeChord,
    analysis,
    voicings,
    activeVoicing
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">GA</div>
          <div>
            <strong>Guitar Academy</strong>
            <small>Relationship OS · V3</small>
          </div>
        </div>
        <nav aria-label="Learning workspaces">
          {NAVIGATION.map((item) => (
            <button
              className={state.workspace === item.id ? "is-active" : ""}
              onClick={() =>
                dispatch({ type: "patch", patch: { workspace: item.id } })
              }
              key={item.id}
            >
              <span className="nav-index">{item.short}</span>
              <span>
                <strong>{item.label}</strong>
                <small>{item.description}</small>
              </span>
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="depth-status">
            <span>Current depth</span>
            <strong>{state.depth}</strong>
          </div>
          <button
            className="utility-button"
            onClick={() =>
              dispatch({
                type: "patch",
                patch: { theme: state.theme === "dark" ? "light" : "dark" }
              })
            }
          >
            {state.theme === "dark" ? "Light interface" : "Dark interface"}
          </button>
        </div>
      </aside>
      <main>
        <ContextBar state={state} dispatch={dispatch} />
        <div className="workspace">
          {state.workspace === "learn" && <Learn {...workspaceProps} />}
          {state.workspace === "explore" && <Explore {...workspaceProps} />}
          {state.workspace === "fretboard" && <FretboardLab {...workspaceProps} />}
          {state.workspace === "harmony" && <Harmony {...workspaceProps} />}
          {state.workspace === "progressions" && <Progressions {...workspaceProps} />}
          {state.workspace === "ear" && <Ear {...workspaceProps} />}
          {state.workspace === "practice" && <Practice {...workspaceProps} />}
          {state.workspace === "advanced" && <Advanced {...workspaceProps} />}
        </div>
      </main>
    </div>
  );
}
