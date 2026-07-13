import { fallbackName, INTERVALS, normalize } from "../domain/music";
import { PROGRESSIONS } from "../content/progressions";
import type { FeatureProps } from "../features/types";

export function ScaleFormulaPanel({ state, dispatch, model }: FeatureProps) {
  return (
    <section className="panel data-panel scale-formula-panel">
      <div className="panel-kicker">Scale formula</div>
      <h2>{state.context.tonic.name} {state.context.mode}</h2>
      <div className="formula-row">
        {model.scale.map((tone) => (
          <button
            className={tone.pitch.pitchClass === state.selectedPitchClass ? "is-active" : ""}
            onClick={() => dispatch({ type: "focusPitch", pitchClass: tone.pitch.pitchClass })}
            key={tone.degree}
          >
            <strong>D{tone.degreeLabel}</strong>
            <span>{tone.pitch.name}</span>
            <small>{tone.interval}</small>
          </button>
        ))}
      </div>
      <p>Semitone pattern: {model.scale.map((tone, index) => index === 0 ? null : normalize(tone.interval - model.scale[index - 1].interval)).filter(Boolean).join(" – ")}</p>
    </section>
  );
}

export function IntervalMatrixPanel({ state, dispatch }: FeatureProps) {
  return (
    <section className="panel data-panel interval-matrix-panel">
      <div className="panel-kicker">Interval matrix</div>
      <h2>Every distance from {state.context.tonic.name}</h2>
      <div className="interval-matrix">
        {INTERVALS.map((interval) => (
          <button
            className={state.selectedInterval === interval.semitones ? "is-active" : ""}
            onClick={() => {
              dispatch({ type: "setSelectedInterval", semitones: interval.semitones });
              dispatch({ type: "focusPitch", pitchClass: normalize(state.context.tonic.pitchClass + interval.semitones) });
            }}
            key={interval.semitones}
          >
            <strong>{interval.label}</strong>
            <span>{fallbackName(normalize(state.context.tonic.pitchClass + interval.semitones), state.context.tonic.accidental < 0)}</span>
            <small>{interval.colour}</small>
          </button>
        ))}
      </div>
    </section>
  );
}

export function ChordNetworkPanel(props: FeatureProps) {
  const { dispatch, model } = props;
  return (
    <section className="panel data-panel chord-network-panel">
      <div className="panel-kicker">Chord network</div>
      <h2>Shared tones around {model.activeChord.symbol}</h2>
      <div className="chord-network">
        {model.chords.map((chord) => {
          const shared = chord.tones.filter((tone) =>
            model.activeChord.tones.some((activeTone) => activeTone.pitch.pitchClass === tone.pitch.pitchClass)
          );
          return (
            <button
              className={chord.id === model.activeChord.id ? "is-active" : ""}
              onClick={() => dispatch({ type: "focusChord", degree: chord.degree })}
              key={chord.id}
            >
              <span>{chord.romanNumeral}</span>
              <strong>{chord.symbol}</strong>
              <small>{shared.length} shared · {chord.functionLabel}</small>
            </button>
          );
        })}
      </div>
    </section>
  );
}

export function ProgressionLibraryPanel({ state, dispatch }: FeatureProps) {
  const featured = PROGRESSIONS.filter((progression) =>
    ["twelve-bar", "jazz-two-five-one", "andalusian", "dorian-vamp", "backdoor"].includes(progression.id)
  );
  return (
    <section className="panel data-panel progression-library-panel">
      <div className="panel-kicker">Progression library</div>
      <h2>{PROGRESSIONS.length} connected forms</h2>
      <div>
        {featured.map((progression) => (
          <button
            className={state.progressionId === progression.id ? "is-active" : ""}
            onClick={() => dispatch({ type: "setProgression", id: progression.id })}
            key={progression.id}
          >
            <span>{progression.category}</span>
            <strong>{progression.name}</strong>
            <small>{progression.formula}</small>
          </button>
        ))}
      </div>
      <button className="text-link" onClick={() => dispatch({ type: "setWorkspace", workspace: "progressions" })}>
        Browse all styles and forms
      </button>
    </section>
  );
}
