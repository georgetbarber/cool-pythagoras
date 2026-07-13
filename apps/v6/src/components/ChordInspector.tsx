import { playVoicing } from "../audio/engine";
import { buildScale } from "../core/music/theory";
import type { Chord, TonalContext } from "../core/music/types";
import { generateShapes } from "../core/instrument/guitar";
import type { GuitarShape } from "../core/instrument/guitar";
import { Fretboard } from "./Fretboard";

function colourExplanation(chord: Chord): string {
  if (chord.quality === "major" || chord.quality === "major7") {
    return `The major third gives ${chord.symbol} its bright identity; ${chord.quality === "major7" ? "the major seventh adds smooth tension toward the root." : "the fifth stabilises the shape."}`;
  }
  if (chord.quality === "minor" || chord.quality === "minor7") {
    return `The b3 creates the minor colour; ${chord.quality === "minor7" ? "the b7 adds a softer, less final edge." : "the fifth keeps the chord grounded."}`;
  }
  if (chord.quality === "dominant7") {
    return "The major third and b7 form a tritone. That internal tension creates the chord's blues colour or dominant pull, depending on context.";
  }
  if (chord.quality === "diminished" || chord.quality === "half-diminished7") {
    return "The b3 and b5 compress the chord into an unstable structure that usually sounds like it wants to move.";
  }
  return "Its colour comes from the interval pattern shown below, while its function comes from the tonal context.";
}

export function ChordInspector({
  chord,
  context,
  shape: providedShape
}: {
  chord: Chord;
  context: TonalContext;
  shape?: GuitarShape | null;
}) {
  const shape = providedShape ?? generateShapes(chord)[0] ?? null;
  const third = chord.tones.find((tone) => ["b3", "3"].includes(tone.intervalLabel));
  return (
    <section className="panel chord-inspector" aria-label={`Inspect ${chord.symbol}`}>
      <div className="panel-heading">
        <div>
          <div className="section-label">Selected progression chord</div>
          <h2>{chord.roman} · {chord.symbol}</h2>
          <p>{chord.explanation}</p>
        </div>
        <button
          className="button secondary"
          disabled={!shape}
          onClick={() => shape && playVoicing(shape.positions.map((position) => position.midi))}
        >
          Hear displayed shape
        </button>
      </div>
      <div className="inspector-facts">
        <article>
          <small>Chord tones</small>
          <strong>{chord.tones.map((tone) => tone.name).join(" - ")}</strong>
          <span>{chord.tones.map((tone) => `C${tone.intervalLabel}`).join(" - ")}</span>
        </article>
        <article>
          <small>Relative to {context.tonicName}</small>
          <strong>{chord.roman}</strong>
          <span>{chord.functionLabel}</span>
        </article>
        <article>
          <small>Why this colour?</small>
          <strong>{chord.quality.replaceAll("-", " ")}</strong>
          <span>{colourExplanation(chord)}</span>
        </article>
      </div>
      {shape && (
        <>
          <Fretboard
            scale={buildScale(context)}
            chord={chord}
            shape={shape}
            selectedPitch={chord.root}
            visible="chord"
            fretStart={Math.max(0, shape.minFret - 1)}
            fretEnd={Math.min(15, Math.max(shape.maxFret + 1, shape.minFret + 4))}
          />
          <div className="experiment-list">
            <strong>Try next</strong>
            <span>Move this exact shape two frets and name the new root before looking.</span>
            {third && <span>Mute the {third.intervalLabel} ({third.name}) and hear how the chord quality becomes less definite.</span>}
            <span>Play this chord, pause, then resolve to {context.tonicName}. Describe whether the return feels directed, modal, or weak.</span>
          </div>
        </>
      )}
    </section>
  );
}
