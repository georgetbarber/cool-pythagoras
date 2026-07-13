import { playChord, playVoicing } from "../audio/engine";
import { HelpButton } from "../components/HelpButton";
import { ShapeExplorer } from "../components/ShapeExplorer";
import { WorkspaceHeader } from "../components/WorkspaceHeader";
import { HELP } from "../content/catalog";
import { generateShapes } from "../core/instrument/guitar";
import { chordToneDisplayLabel } from "../core/music/theory";
import type { FeatureProps } from "./types";

export function Harmony({ state, dispatch, model }: FeatureProps) {
  return (
    <div className="workspace-stack">
      <WorkspaceHeader
        eyebrow="Harmony builder"
        title="See how chords emerge from the active scale."
        description="Chord quality comes from stacked intervals. Roman numeral and function describe what that structure means relative to the tonal centre."
        action={
          <label className="toggle">
            <input type="checkbox" checked={state.sevenths} onChange={() => dispatch({ type: "toggleSevenths" })} />
            Add sevenths
          </label>
        }
      />
      <section className="panel harmony-explainer">
        <div>
          <div className="section-label">Construction rule</div>
          <h2>Take a scale tone, skip one, take one.</h2>
          <p>Stacking alternate scale tones produces thirds. Three tones form a triad; four form a seventh chord.</p>
        </div>
        <div className="stack-diagram">
          {model.activeChord.tones.map((tone, index) => (
            <span style={{ "--stack": index } as React.CSSProperties} key={tone.intervalLabel}>
              <b>Chord {chordToneDisplayLabel(tone.intervalLabel)}</b>{tone.name}
            </span>
          ))}
        </div>
        <HelpButton {...HELP.romanNumerals} />
      </section>
      <div className="harmony-grid">
        {model.chords.map((chord) => (
          <article className={`panel chord-card ${chord.degree === model.activeChord.degree ? "is-active" : ""}`} key={chord.id}>
            <button className="chord-card-main" onClick={() => dispatch({ type: "selectChord", degree: chord.degree })}>
              <span>{chord.roman}</span>
              <strong>{chord.symbol}</strong>
              <small>{chord.functionLabel}</small>
              <div>{chord.tones.map((tone) => <i key={tone.intervalLabel}><b>{tone.intervalLabel}</b>{tone.name}</i>)}</div>
              <p>{chord.explanation}</p>
            </button>
            <button className="hear-button" onClick={() => {
              const shape = generateShapes(chord)[0];
              if (shape) playVoicing(shape.positions.map((position) => position.midi));
              else playChord(chord.tones.map((tone) => tone.pitchClass));
            }}>Hear playable voicing</button>
          </article>
        ))}
      </div>
      <ShapeExplorer state={state} dispatch={dispatch} model={model} />
    </div>
  );
}
