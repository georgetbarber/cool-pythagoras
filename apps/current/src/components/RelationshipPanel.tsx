import { playRelationship } from "../audio/engine";
import {
  analyzeRelationship,
  chordToneDisplayLabel,
  displayRelationshipLabel
} from "../core/music/theory";
import { HELP } from "../content/catalog";
import { HelpButton } from "./HelpButton";
import type { FeatureProps } from "../features/types";

export function RelationshipPanel({ state, model }: FeatureProps) {
  const relationship = analyzeRelationship(state.context, state.selectedPitch, model.activeChord);
  return (
    <aside className="panel relationship-panel">
      <div className="section-label">Relationship inspector</div>
      <div className="relationship-title">
        <span>{relationship.noteName}</span>
        <div>
          <h2>Relative to what?</h2>
          <p>{relationship.summary}</p>
        </div>
        <HelpButton {...HELP.degreeVsChord} />
      </div>
      <div className="relationship-facts">
        <article>
          <small>To tonic {state.context.tonicName}</small>
          <strong>{relationship.tonicIntervalLabel}</strong>
          <span>{relationship.tonicIntervalName}</span>
        </article>
        <article>
          <small>Scale role</small>
          <strong>
            {relationship.scaleDegree
              ? `Scale degree ${displayRelationshipLabel(relationship.scaleDegree.degreeLabel)}`
              : "Outside scale"}
          </strong>
          <span>{relationship.scaleDegree?.intervalName ?? "chromatic colour"}</span>
        </article>
        <article>
          <small>Inside {model.activeChord.symbol}</small>
          <strong>
            {relationship.chordTone
              ? `Chord tone ${chordToneDisplayLabel(relationship.chordTone.intervalLabel)}`
              : "Non-chord tone"}
          </strong>
          <span>{model.activeChord.functionLabel}</span>
        </article>
      </div>
      <div className="tendency-card">
        <small>Likely movement</small>
        <p>{relationship.tendency}</p>
      </div>
      <button
        className="button primary"
        onClick={() => playRelationship(state.context.tonic, relationship.pitchClass)}
      >
        Hear against tonic
      </button>
    </aside>
  );
}
