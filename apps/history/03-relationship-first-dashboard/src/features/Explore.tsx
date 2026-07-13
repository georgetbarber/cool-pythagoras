import { Fretboard } from "../components/Fretboard";
import { RelationshipInspector } from "../components/RelationshipInspector";
import { MODES } from "../domain/music";
import type { WorkspaceProps } from "./types";

export function Explore({
  state,
  dispatch,
  scale,
  activeChord,
  activeVoicing,
  analysis
}: WorkspaceProps) {
  return (
    <div className="workspace-stack">
      <section className="panel workspace-heading">
        <div>
          <p className="eyebrow">Context explorer</p>
          <h1>One note, several relationships.</h1>
          <p>{MODES[state.context.mode].character}</p>
        </div>
        <div className="segmented">
          {(["degree", "interval", "note"] as const).map((mode) => (
            <button
              className={state.labelMode === mode ? "is-active" : ""}
              onClick={() =>
                dispatch({ type: "patch", patch: { labelMode: mode } })
              }
              key={mode}
            >
              {mode}
            </button>
          ))}
        </div>
      </section>
      <div className="workspace-grid inspector-grid">
        <section className="panel fretboard-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Interactive map</p>
              <h2>Select any position</h2>
            </div>
            <span className="context-pill">{activeChord.symbol}</span>
          </div>
          <Fretboard
            scale={scale}
            chord={activeChord}
            voicing={activeVoicing}
            selectedPitchClass={state.selectedPitchClass}
            labelMode={state.labelMode}
            showScale={state.showScale}
            showChord={state.showChord}
            showRoots={state.showRoots}
            onSelect={(selectedPitchClass) =>
              dispatch({ type: "patch", patch: { selectedPitchClass } })
            }
          />
          <div className="tone-strip">
            {scale.map((tone) => (
              <button
                className={
                  tone.pitch.pitchClass === state.selectedPitchClass ? "is-active" : ""
                }
                onClick={() =>
                  dispatch({
                    type: "patch",
                    patch: { selectedPitchClass: tone.pitch.pitchClass }
                  })
                }
                key={tone.degree}
              >
                <strong>{tone.degreeLabel}</strong>
                <span>{tone.pitch.name}</span>
              </button>
            ))}
          </div>
        </section>
        <RelationshipInspector
          context={state.context}
          analysis={analysis}
          chord={activeChord}
        />
      </div>
    </div>
  );
}
