import { Fretboard } from "../components/Fretboard";
import { RelationshipPanel } from "../components/RelationshipPanel";
import { WorkspaceHeader } from "../components/WorkspaceHeader";
import {
  analyzeRelationship,
  chordToneDisplayLabel,
  displayRelationshipLabel
} from "../core/music/theory";
import type { FeatureProps } from "./types";

export function Explore(props: FeatureProps) {
  const { state, dispatch, model } = props;
  const relationship = analyzeRelationship(state.context, state.selectedPitch, model.activeChord);
  const containing = model.chords.filter((chord) =>
    chord.tones.some((tone) => tone.pitchClass === state.selectedPitch)
  );
  return (
    <div className="workspace-stack">
      <WorkspaceHeader
        eyebrow="Context explorer"
        title="One pitch can have several meanings."
        description="Select a note, then compare its role relative to tonic, scale, chord, physical location, and likely movement."
      />
      <div className="explore-layout">
        <section className="panel relationship-map">
          <div className="relationship-centre">
            <small>selected pitch</small>
            <strong>{relationship.noteName}</strong>
            <span>{relationship.tonicIntervalLabel} to {state.context.tonicName}</span>
          </div>
          <div className="relationship-spokes">
            <article><small>Scale</small><strong>{relationship.scaleDegree ? `Scale degree ${displayRelationshipLabel(relationship.scaleDegree.degreeLabel)}` : "outside scale"}</strong><span>{relationship.scaleDegree?.intervalName}</span></article>
            <article><small>Chord</small><strong>{relationship.chordTone ? `Chord tone ${chordToneDisplayLabel(relationship.chordTone.intervalLabel)}` : "non-chord tone"}</strong><span>{model.activeChord.symbol}</span></article>
            <article><small>Sound</small><strong>{relationship.tonicIntervalName}</strong><span>{relationship.tendency}</span></article>
            <article><small>Fretboard</small><strong>{state.selectedPosition ? `S${state.selectedPosition.string + 1} fret ${state.selectedPosition.fret}` : "all positions"}</strong><span>same identity</span></article>
          </div>
        </section>
        <section className="panel containing-chords">
          <div className="section-label">Appears inside</div>
          <h2>{containing.length} active-scale chords</h2>
          {containing.map((chord) => {
            const role = chord.tones.find((tone) => tone.pitchClass === state.selectedPitch);
            return (
              <button onClick={() => dispatch({ type: "selectChord", degree: chord.degree })} key={chord.id}>
                <span>{chord.roman}</span>
                <strong>{chord.symbol}</strong>
                <small>Chord tone {role ? chordToneDisplayLabel(role.intervalLabel) : "unknown"} · {chord.functionLabel}</small>
              </button>
            );
          })}
        </section>
        <RelationshipPanel {...props} />
      </div>
      <section className="panel fretboard-panel">
        <div className="panel-heading">
          <div><div className="section-label">Physical identity</div><h2>Every {relationship.noteName} on the neck</h2></div>
        </div>
        <Fretboard
          scale={model.scale}
          chord={model.activeChord}
          selectedPitch={state.selectedPitch}
          selectedPosition={state.selectedPosition}
          labelMode={state.labelMode}
          onPosition={(position) => dispatch({ type: "selectPosition", ...position })}
        />
      </section>
    </div>
  );
}
