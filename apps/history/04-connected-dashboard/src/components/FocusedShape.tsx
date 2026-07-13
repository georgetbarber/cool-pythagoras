import { playChord } from "../audio/engine";
import { fallbackName } from "../domain/music";
import { focusedWindow } from "../instrument/guitar";
import { Fretboard } from "./Fretboard";
import type { FeatureProps } from "../features/types";

const INVERSION_NAMES = ["root position", "first inversion", "second inversion", "third inversion", "fourth inversion"];

export function FocusedShape({ state, dispatch, model }: FeatureProps) {
  const window = focusedWindow(model.activeVoicing);
  const omitted = model.activeVoicing?.omittedPitchClasses.map((pc) => fallbackName(pc)) ?? [];
  return (
    <section className="panel focused-shape">
      <div className="panel-heading">
        <div>
          <div className="panel-kicker">Focused shape</div>
          <h2>
            {model.activeChord.symbol}
            {model.activeVoicing && ` · ${INVERSION_NAMES[model.activeVoicing.inversion] ?? `inversion ${model.activeVoicing.inversion}`}`}
          </h2>
          <p>
            {model.activeVoicing
              ? `${model.activeVoicing.bassLabel} in the bass · ${model.activeVoicing.positions.length} strings · physical span ${model.activeVoicing.physicalSpan}`
              : "No playable shape found for the current constraints."}
          </p>
        </div>
        <div className="shape-actions">
          <label>
            Strings
            <select
              value={state.stringPolicy}
              onChange={(event) => {
                const value = event.target.value;
                dispatch({ type: "setStringPolicy", policy: value === "auto" ? "auto" : Number(value) as 3 | 4 | 5 | 6 });
              }}
            >
              <option value="auto">Auto ({model.activeChord.tones.length})</option>
              <option value="3">3 strings</option>
              <option value="4">4 strings</option>
              <option value="5">5 strings</option>
              <option value="6">6 strings</option>
            </select>
          </label>
          <button
            className="button primary"
            disabled={!model.activeVoicing}
            onClick={() => model.activeVoicing && playChord(model.activeVoicing.positions.map((position) => position.midi))}
          >
            Hear shape
          </button>
        </div>
      </div>
      {omitted.length > 0 && <p className="warning">Incomplete voicing: omits {omitted.join(", ")}.</p>}
      <Fretboard
        scale={model.scale}
        chord={model.activeChord}
        voicing={model.activeVoicing}
        selectedPitchClass={state.selectedPitchClass}
        selectedPosition={state.selectedPosition}
        labelMode="chord"
        layers={{ scale: false, chord: true, tonic: true, voicing: true, selection: true }}
        strings={window.strings}
        fretStart={window.start}
        fretEnd={window.end}
        focused
        onPosition={(position) => dispatch({ type: "focusPosition", ...position })}
      />
      <div className="voicing-carousel">
        {model.voicings.slice(0, state.depth === "essential" ? 4 : state.depth === "expanded" ? 8 : 12).map((voicing, index) => (
          <button
            className={index === model.safeVoicingIndex ? "is-active" : ""}
            onClick={() => dispatch({ type: "focusVoicing", index })}
            aria-pressed={index === model.safeVoicingIndex}
            key={voicing.id}
          >
            <span>Shape {index + 1}</span>
            <strong>{voicing.positions.map((position) => position.fret).join(" · ")}</strong>
            <small>{INVERSION_NAMES[voicing.inversion] ?? `inv. ${voicing.inversion}`} · span {voicing.physicalSpan}</small>
          </button>
        ))}
      </div>
    </section>
  );
}

