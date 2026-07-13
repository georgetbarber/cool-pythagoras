import type { FeatureProps } from "../features/types";

export function HarmonyRail({ state, dispatch, model }: FeatureProps) {
  return (
    <section className="panel harmony-rail">
      <div className="panel-heading compact">
        <div>
          <div className="panel-kicker">Harmony in context</div>
          <h2>{state.sevenths ? "Diatonic sevenths" : "Diatonic triads"}</h2>
        </div>
        <label className="switch">
          <span>7ths</span>
          <input type="checkbox" checked={state.sevenths} onChange={(event) => dispatch({ type: "setSevenths", value: event.target.checked })} />
        </label>
      </div>
      <div className="chord-list">
        {model.chords.map((chord) => (
          <button
            className={chord.degree === model.activeChord.degree ? "is-active" : ""}
            onClick={() => dispatch({ type: "focusChord", degree: chord.degree })}
            aria-pressed={chord.degree === model.activeChord.degree}
            key={chord.id}
          >
            <span className="roman">{chord.romanNumeral}</span>
            <span className="chord-name">
              <strong>{chord.symbol}</strong>
              <small>{chord.functionLabel}</small>
            </span>
            <span className="tone-count">{chord.tones.length}</span>
          </button>
        ))}
      </div>
      <div className="function-note">
        <strong>{model.activeChord.functionFamily}</strong>
        <p>{model.activeChord.explanation}</p>
      </div>
    </section>
  );
}

