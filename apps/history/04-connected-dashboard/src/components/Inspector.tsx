import { playRelationship } from "../audio/engine";
import type { FeatureProps } from "../features/types";

export function Inspector({ state, model }: FeatureProps) {
  const { relationship, activeChord } = model;
  return (
    <aside className="panel inspector">
      <div className="panel-kicker">Relationship inspector</div>
      <div className="inspector-title">
        <span className="pitch-orb">{relationship.pitch.name}</span>
        <div>
          <h2>Relative to what?</h2>
          <p>{relationship.summary}</p>
        </div>
      </div>
      <div className="relationship-grid">
        <div>
          <span>To {state.context.tonic.name}</span>
          <strong>{relationship.tonicIntervalLabel}</strong>
          <small>{relationship.tonicIntervalName}</small>
        </div>
        <div>
          <span>Degree relative to {state.context.tonic.name}</span>
          <strong>{relationship.scaleTone ? `D${relationship.scaleTone.degreeLabel}` : "Chromatic"}</strong>
          <small>{relationship.scaleTone ? `degree ${relationship.scaleTone.degree}` : "outside collection"}</small>
        </div>
        <div>
          <span>Chord tone relative to {activeChord.root.name}</span>
          <strong>{relationship.chordTone ? `C${relationship.chordTone.intervalLabel}` : "Non-chord"}</strong>
          <small>{relationship.chordTone ? "chord tone" : "available tension or passing tone"}</small>
        </div>
      </div>
      <div className="tendency">
        <span>Likely motion</span>
        <p>{relationship.tendency}</p>
      </div>
      <button className="button primary" onClick={() => playRelationship(state.context.tonic.pitchClass, relationship.pitch.pitchClass)}>
        Hear against tonic
      </button>
    </aside>
  );
}
