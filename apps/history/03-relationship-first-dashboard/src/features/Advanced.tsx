import { playChord } from "../audio/engine";
import {
  buildBorrowedChords,
  buildDiatonicChords,
  buildScale,
  buildSecondaryDominants,
  MODES
} from "../domain/music";
import type { ModeId } from "../domain/types";
import { generateVoicings } from "../guitar/model";
import type { WorkspaceProps } from "./types";

const PARALLEL_MODES: ModeId[] = [
  "major",
  "dorian",
  "phrygian",
  "lydian",
  "mixolydian",
  "minor",
  "harmonic-minor"
];

export function Advanced({ state }: WorkspaceProps) {
  const comparisons = PARALLEL_MODES.map((mode) => {
    const context = { ...state.context, mode };
    const scale = buildScale(context);
    const chords = buildDiatonicChords(context, true);
    return { mode, scale, chords };
  });
  const borrowed = buildBorrowedChords(state.context);
  const secondaryDominants = buildSecondaryDominants(state.context);

  const hearChord = (chord: ReturnType<typeof buildDiatonicChords>[number]) => {
    const voicing = generateVoicings(chord, { limit: 1 })[0];
    if (voicing) playChord(voicing.positions.map((position) => position.midi));
  };

  return (
    <div className="workspace-stack">
      <section className="panel workspace-heading">
        <div>
          <p className="eyebrow">Advanced relationships</p>
          <h1>Keep the centre. Change the context.</h1>
          <p>
            Parallel comparison makes altered degrees, modal chords, and harmonic
            reinterpretation visible without losing the shared tonic.
          </p>
        </div>
      </section>
      <section className="parallel-grid">
        {comparisons.map(({ mode, scale, chords }) => (
          <article className="panel parallel-card" key={mode}>
            <div>
              <span className="level-tag level-advanced">parallel</span>
              <h2>{MODES[mode].name}</h2>
              <p>{MODES[mode].character}</p>
            </div>
            <div className="degree-sequence">
              {scale.map((tone) => (
                <span key={tone.degree}>
                  <strong>{tone.degreeLabel}</strong>
                  {tone.pitch.name}
                </span>
              ))}
            </div>
            <div className="roman-sequence">
              {chords.map((chord) => (
                <span title={chord.symbol} key={chord.id}>
                  {chord.romanNumeral}
                </span>
              ))}
            </div>
          </article>
        ))}
      </section>
      <section className="advanced-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Modal interchange</p>
            <h2>Borrow color without moving the tonal centre</h2>
          </div>
          <p>
            Each chord comes from the parallel collection. Its altered degrees are
            heard against the original tonic, not as an unrelated chord symbol.
          </p>
        </div>
        <div className="chromatic-grid">
          {borrowed.map((chord) => (
            <button
              className="panel chromatic-card"
              onClick={() => hearChord(chord)}
              key={chord.id}
            >
              <span>{chord.romanNumeral}</span>
              <strong>{chord.symbol}</strong>
              <small>{chord.tones.map((tone) => tone.intervalLabel).join(" · ")}</small>
              <p>{chord.functionExplanation}</p>
            </button>
          ))}
        </div>
      </section>
      <section className="advanced-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Secondary dominants</p>
            <h2>Direct tension toward a temporary goal</h2>
          </div>
          <p>
            The slash answers “dominant of what?” and keeps the chromatic chord
            tied to its intended resolution.
          </p>
        </div>
        <div className="chromatic-grid">
          {secondaryDominants.map((chord) => (
            <button
              className="panel chromatic-card"
              onClick={() => hearChord(chord)}
              key={chord.id}
            >
              <span>{chord.romanNumeral}</span>
              <strong>{chord.symbol}</strong>
              <small>{chord.tones.map((tone) => `${tone.pitch.name} (${tone.intervalLabel})`).join(" · ")}</small>
              <p>{chord.functionExplanation}</p>
            </button>
          ))}
        </div>
      </section>
      <section className="panel analysis-note">
        <p className="eyebrow">Next advanced modules</p>
        <h2>Directed expansion, not disconnected feature collecting</h2>
        <p>
          Altered dominants, diminished systems, reharmonization, and non-functional
          analysis will extend these same contextual objects. Each module must
          explain its temporary centre, altered degrees, voice movement, and
          fretboard realization.
        </p>
      </section>
    </div>
  );
}
