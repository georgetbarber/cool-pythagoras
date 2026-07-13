import { playChord } from "../audio/engine";
import { Fretboard } from "../components/Fretboard";
import { rootAnchors } from "../guitar/model";
import type { WorkspaceProps } from "./types";

export function FretboardLab({
  state,
  dispatch,
  scale,
  activeChord,
  voicings,
  activeVoicing
}: WorkspaceProps) {
  const anchors = rootAnchors(state.context.tonic.pitchClass);
  return (
    <div className="workspace-stack">
      <section className="panel workspace-heading">
        <div>
          <p className="eyebrow">Fretboard geography</p>
          <h1>Shapes are interval structures.</h1>
          <p>
            Anchor the tonic, inspect the intervals inside a shape, then move the
            same structure without losing its meaning.
          </p>
        </div>
        <div className="metric-pair">
          <div><strong>{anchors.length}</strong><span>root anchors</span></div>
          <div><strong>{voicings.length}</strong><span>nearby voicings</span></div>
        </div>
      </section>
      <section className="panel fretboard-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Active shape</p>
            <h2>{activeChord.symbol} · {activeVoicing ? `inversion ${activeVoicing.inversion}` : "no result"}</h2>
          </div>
          <button
            className="primary-button"
            disabled={!activeVoicing}
            onClick={() =>
              activeVoicing &&
              playChord(activeVoicing.positions.map((position) => position.midi))
            }
          >
            Hear shape
          </button>
        </div>
        <Fretboard
          scale={scale}
          chord={activeChord}
          voicing={activeVoicing}
          selectedPitchClass={state.selectedPitchClass}
          labelMode="interval"
          showScale={state.depth !== "essential"}
          showChord
          showRoots
          onSelect={(selectedPitchClass) =>
            dispatch({ type: "patch", patch: { selectedPitchClass } })
          }
        />
      </section>
      <section className="voicing-grid">
        {voicings.slice(0, state.depth === "essential" ? 4 : state.depth === "expanded" ? 8 : 12).map((voicing, index) => (
          <button
            className={`panel voicing-card ${index === state.activeVoicingIndex ? "is-active" : ""}`}
            key={voicing.id}
            onClick={() => {
              dispatch({
                type: "patch",
                patch: { activeVoicingIndex: index }
              });
              playChord(voicing.positions.map((position) => position.midi));
            }}
          >
            <span>Shape {index + 1}</span>
            <strong>{voicing.positions.map((position) => position.fret).join(" · ")}</strong>
            <small>inv. {voicing.inversion} · span {voicing.fretSpan}</small>
          </button>
        ))}
      </section>
    </div>
  );
}
