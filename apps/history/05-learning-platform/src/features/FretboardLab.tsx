import { Fretboard } from "../components/Fretboard";
import { HelpButton } from "../components/HelpButton";
import { WorkspaceHeader } from "../components/WorkspaceHeader";
import { buildFretboard, generateShapes } from "../core/instrument/guitar";
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
  const shapes = generateShapes(model.activeChord);
  const shape = shapes[0] ?? null;
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
          <HelpButton {...HELP.shape} />
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
        <section className="panel">
          <div className="section-label">Chord shape</div>
          <h2>{model.activeChord.symbol} encodes {model.activeChord.tones.map((tone) => tone.intervalLabel).join(" - ")}</h2>
          <p>{shape ? `${shape.positions.length} strings, ${shape.span}-fret span${shape.rootInBass ? ", root in bass" : ""}.` : "No compact shape found."}</p>
          <Fretboard
            scale={model.scale}
            chord={model.activeChord}
            shape={shape}
            visible="chord"
            fretStart={shape ? Math.max(0, Math.min(...shape.positions.map((position) => position.fret)) - 1) : 0}
            fretEnd={shape ? Math.min(15, Math.max(...shape.positions.map((position) => position.fret)) + 1) : 5}
          />
        </section>
      </div>
    </div>
  );
}
