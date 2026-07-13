import { playChord } from "../audio/engine";
import type { WorkspaceProps } from "./types";

export function Harmony({
  state,
  dispatch,
  chords,
  activeChord,
  voicings
}: WorkspaceProps) {
  return (
    <div className="workspace-stack">
      <section className="panel workspace-heading">
        <div>
          <p className="eyebrow">Harmony laboratory</p>
          <h1>Chords emerge from the scale.</h1>
          <p>
            Roman numerals preserve each chord’s relationship to the tonal centre
            while note names show how that function appears in this key.
          </p>
        </div>
        <label className="toggle">
          <span>Seventh chords</span>
          <input
            type="checkbox"
            checked={state.seventhChords}
            onChange={(event) =>
              dispatch({
                type: "patch",
                patch: { seventhChords: event.target.checked }
              })
            }
          />
        </label>
      </section>
      <section className="harmony-grid">
        {chords.map((chord) => {
          const active = chord.degree === activeChord.degree;
          return (
            <article className={`panel harmony-card ${active ? "is-active" : ""}`} key={chord.id}>
              <button
                className="harmony-select"
                onClick={() =>
                  dispatch({
                    type: "patch",
                    patch: {
                      activeChordDegree: chord.degree,
                      activeVoicingIndex: 0,
                      selectedPitchClass: chord.root.pitchClass
                    }
                  })
                }
              >
                <span className="roman">{chord.romanNumeral}</span>
                <strong>{chord.symbol}</strong>
                <small>{chord.function}</small>
              </button>
              <div className="chord-tone-row">
                {chord.tones.map((tone) => (
                  <span key={tone.intervalLabel}>
                    <strong>{tone.intervalLabel}</strong>
                    {tone.pitch.name}
                  </span>
                ))}
              </div>
              {active && (
                <div className="function-explanation">
                  <p>{chord.functionExplanation}</p>
                  <button
                    className="text-button"
                    disabled={!voicings[0]}
                    onClick={() =>
                      voicings[0] &&
                      playChord(voicings[0].positions.map((position) => position.midi))
                    }
                  >
                    Hear this function
                  </button>
                </div>
              )}
            </article>
          );
        })}
      </section>
    </div>
  );
}
