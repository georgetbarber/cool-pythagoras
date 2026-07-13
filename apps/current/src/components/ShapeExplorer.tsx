import { playVoicing } from "../audio/engine";
import { generateShapes } from "../core/instrument/guitar";
import { chordToneDisplayLabel } from "../core/music/theory";
import { Fretboard } from "./Fretboard";
import type { FeatureProps } from "../features/types";

export function ShapeExplorer({ state, dispatch, model }: FeatureProps) {
  const shapes = generateShapes(model.activeChord);
  const safeIndex = Math.min(state.selectedShapeIndex, Math.max(0, shapes.length - 1));
  const shape = shapes[safeIndex] ?? null;
  const start = shape ? Math.max(0, shape.minFret - 1) : 0;
  const end = shape ? Math.min(15, Math.max(start + 4, shape.maxFret + 1)) : 5;

  return (
    <section className="panel shape-explorer">
      <div className="panel-heading">
        <div>
          <div className="section-label">Playable chord family</div>
          <h2>{model.activeChord.symbol} · {shape?.inversionLabel ?? "No compact voicing"}</h2>
          <p>
            {shape
              ? `Bass is chord ${chordToneDisplayLabel(shape.bassIntervalLabel)} · pattern ${shape.fretPattern} · span ${shape.span} frets`
              : "No complete compact voicing was found within the current limits."}
          </p>
        </div>
        <button
          className="button secondary"
          disabled={!shape}
          onClick={() => shape && playVoicing(shape.positions.map((position) => position.midi))}
        >
          Hear this voicing
        </button>
      </div>
      <Fretboard
        scale={model.scale}
        chord={model.activeChord}
        shape={shape}
        visible="chord"
        fretStart={start}
        fretEnd={end}
      />
      <div className="shape-choices">
        {shapes.map((candidate, index) => (
          <button
            className={safeIndex === index ? "is-active" : ""}
            onClick={() => dispatch({ type: "selectShape", index })}
            key={candidate.id}
          >
            <strong>{candidate.inversionLabel}</strong>
            <span>{candidate.fretPattern}</span>
            <small>
              Chord {chordToneDisplayLabel(candidate.bassIntervalLabel)} in bass · {candidate.openStrings ? `${candidate.openStrings} open` : `position ${candidate.minFret}`}
            </small>
          </button>
        ))}
      </div>
    </section>
  );
}
