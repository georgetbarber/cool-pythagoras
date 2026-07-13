import { playChord, playRelationship } from "../audio/engine";
import type { LessonStep } from "../content/catalog";
import { chordToneDisplayLabel } from "../core/music/theory";
import { Fretboard } from "./Fretboard";
import type { FeatureProps } from "../features/types";

export function LessonActivity({
  step,
  completed,
  onComplete,
  state,
  dispatch,
  model
}: FeatureProps & {
  step: LessonStep;
  completed: boolean;
  onComplete: () => void;
}) {
  return (
    <section className="lesson-activity">
      <div className="worked-comparison">
        <div>
          <small>Keep constant</small>
          <strong>{state.context.tonicName} as the reference</strong>
        </div>
        <div>
          <small>Compare</small>
          <strong>
            {step.action === "hear" && "How the target changes against home"}
            {step.action === "find" && "How one identity appears in new locations"}
            {step.action === "play" && "How the relationship feels under the hand"}
            {step.action === "read" && "What changes and what stays the same"}
          </strong>
        </div>
      </div>

      {step.action === "hear" && (
        <div className="lesson-demo-actions">
          <button className="button secondary" onClick={() => playRelationship(state.context.tonic, state.context.tonic)}>
            Hear home
          </button>
          <button className="button secondary" onClick={() => playRelationship(state.context.tonic, state.selectedPitch)}>
            Hear selected relationship
          </button>
          <button className="button secondary" onClick={() => playChord(model.activeChord.tones.map((tone) => tone.pitchClass))}>
            Hear {model.activeChord.symbol}
          </button>
        </div>
      )}

      {step.action === "find" && (
        <Fretboard
          scale={model.scale}
          chord={model.activeChord}
          selectedPitch={state.selectedPitch}
          selectedPosition={state.selectedPosition}
          labelMode={state.labelMode}
          fretStart={0}
          fretEnd={8}
          onPosition={(position) => dispatch({ type: "selectPosition", ...position })}
        />
      )}

      {step.action === "play" && (
        <div className="lesson-play-bridge">
          <div>
            <small>Current playable target</small>
            <strong>{model.activeChord.roman} · {model.activeChord.symbol}</strong>
            <span>{model.activeChord.tones.map((tone) => `Chord ${chordToneDisplayLabel(tone.intervalLabel)}`).join(" - ")}</span>
          </div>
          <button className="button secondary" onClick={() => dispatch({ type: "navigate", route: "play" })}>
            Open play-along studio
          </button>
        </div>
      )}

      <label className="lesson-confirmation">
        <input type="checkbox" checked={completed} onChange={onComplete} />
        I completed the guided action and can describe what stayed constant.
      </label>
    </section>
  );
}
