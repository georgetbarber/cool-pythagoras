import { Fretboard } from "../components/Fretboard";
import { HelpButton } from "../components/HelpButton";
import { ShapeExplorer } from "../components/ShapeExplorer";
import { TriadCagedExplorer } from "../components/TriadCagedExplorer";
import { WorkspaceHeader } from "../components/WorkspaceHeader";
import { buildFretboard, intervalPositions } from "../core/instrument/guitar";
import { INTERVALS } from "./intervalData";
import { HELP } from "../content/catalog";
import { intervalName } from "../core/music/theory";
import type { FeatureProps } from "./types";

export function FretboardLab({ state, dispatch, model }: FeatureProps) {
  const root = buildFretboard().find((position) =>
    position.string === state.selectedPosition?.string &&
    position.fret === state.selectedPosition?.fret
  ) ?? buildFretboard().find((position) =>
    position.string === 5 && position.pitchClass === state.context.tonic
  )!;
  const octaveTargets = intervalPositions(root, 0)
    .filter((position) => Math.abs(position.midi - root.midi) >= 12)
    .sort((a, b) => Math.abs(a.midi - root.midi) - Math.abs(b.midi - root.midi))
    .slice(0, 6);
  return (
    <div className="workspace-stack">
      <WorkspaceHeader
        eyebrow="Fretboard laboratory"
        title="Treat shapes as movable interval structures."
        description="Choose a physical root, isolate one interval, then compare the same relationship across strings and inside a chord shape."
      />
      <section className="panel interval-controls">
        <div>
          <div className="section-label">Interval focus</div>
          <h2>{INTERVALS[state.selectedInterval].label} · {intervalName(state.selectedInterval)}</h2>
          <p>{INTERVALS[state.selectedInterval].description}</p>
        </div>
        <div className="interval-picker">
          {INTERVALS.map((interval, semitones) => (
            <button
              className={state.selectedInterval === semitones ? "is-active" : ""}
              onClick={() => dispatch({ type: "selectInterval", semitones })}
              key={interval.label}
            >
              <strong>{interval.label}</strong>
              <small>{interval.short}</small>
            </button>
          ))}
        </div>
      </section>
      <section className="panel fretboard-panel">
        <div className="panel-heading">
          <div>
            <div className="section-label">Movable geometry</div>
            <h2>Root on string {root.string + 1}, fret {root.fret}</h2>
            <p>Click any fret to make it the new physical root. Gold positions preserve the selected interval.</p>
          </div>
          <div className="help-actions"><HelpButton {...HELP.shape} /><HelpButton {...HELP.intervalClass} /></div>
        </div>
        <Fretboard
          scale={model.scale}
          chord={model.activeChord}
          selectedPitch={root.pitchClass}
          selectedPosition={{ string: root.string, fret: root.fret }}
          relationshipRoot={root.pitchClass}
          targetInterval={state.selectedInterval}
          visible="all"
          onPosition={(position) => dispatch({ type: "selectPosition", ...position })}
        />
      </section>
      <div className="fretboard-analysis">
        <section className="panel">
          <div className="section-label">Tuning rule</div>
          <h2>Most strings are a fourth apart.</h2>
          <p>Shapes remain consistent until they cross the G-B boundary, where the B string is one fret closer.</p>
          <div className="rule-row"><span>E-A</span><span>A-D</span><span>D-G</span><span className="boundary">G-B</span><span>B-E</span></div>
        </section>
        <section className="panel octave-card">
          <div className="section-label">Octave transfer</div>
          <h2>Same pitch identity, new physical location.</h2>
          <p>These positions repeat {root.pitchClass === state.context.tonic ? state.context.tonicName : "the selected pitch"} in another register.</p>
          <div>
            {octaveTargets.map((position) => (
              <button onClick={() => dispatch({ type: "selectPosition", ...position })} key={`${position.string}:${position.fret}`}>
                <strong>String {position.string + 1}</strong>
                <span>fret {position.fret}</span>
                <small>{position.midi > root.midi ? "higher" : "lower"} octave</small>
              </button>
            ))}
          </div>
        </section>
      </div>
      <ShapeExplorer state={state} dispatch={dispatch} model={model} />
      <TriadCagedExplorer state={state} dispatch={dispatch} model={model} />
    </div>
  );
}
