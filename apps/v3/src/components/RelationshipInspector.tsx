import type { Chord, PitchAnalysis, TonalContext } from "../domain/types";
import { playAgainstTonic } from "../audio/engine";

export function RelationshipInspector({
  context,
  analysis,
  chord
}: {
  context: TonalContext;
  analysis: PitchAnalysis;
  chord: Chord | null;
}) {
  return (
    <aside className="panel inspector">
      <div className="inspector-heading">
        <div className="selected-note">{analysis.pitch.name}</div>
        <div>
          <p className="eyebrow">Relationship inspector</p>
          <h2>Relative to what?</h2>
        </div>
      </div>
      <p className="inspector-summary">{analysis.summary}</p>
      <div className="relationship-list">
        <div>
          <span>To tonal centre</span>
          <strong>{analysis.tonicIntervalLabel}</strong>
          <small>from {context.tonic.name}</small>
        </div>
        <div>
          <span>Scale role</span>
          <strong>{analysis.scaleDegree?.degreeLabel ?? "Chromatic"}</strong>
          <small>{analysis.scaleDegree ? `degree ${analysis.scaleDegree.degree}` : "outside collection"}</small>
        </div>
        <div>
          <span>Chord role</span>
          <strong>{analysis.chordTone?.intervalLabel ?? "Non-chord"}</strong>
          <small>{chord?.symbol ?? "no active chord"}</small>
        </div>
      </div>
      <button
        className="primary-button"
        onClick={() =>
          playAgainstTonic(context.tonic.pitchClass, analysis.pitch.pitchClass)
        }
      >
        Hear against tonic
      </button>
    </aside>
  );
}
