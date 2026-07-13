import { useState } from "react";
import { playAgainstTonic } from "../audio/engine";
import type { WorkspaceProps } from "./types";

export function Ear({ state, scale }: WorkspaceProps) {
  const [targetIndex, setTargetIndex] = useState(4);
  const [revealed, setRevealed] = useState(false);
  const target = scale[targetIndex];

  const next = () => {
    let nextIndex = Math.floor(Math.random() * scale.length);
    if (nextIndex === targetIndex) nextIndex = (nextIndex + 1) % scale.length;
    setTargetIndex(nextIndex);
    setRevealed(false);
  };

  return (
    <div className="workspace-stack">
      <section className="panel workspace-heading">
        <div>
          <p className="eyebrow">Contextual ear</p>
          <h1>Hear the relationship, not just the note.</h1>
          <p>
            The tonic sounds before and after the target so the question always has
            a musical reference point.
          </p>
        </div>
      </section>
      <section className="panel ear-stage">
        <div className="ear-orbit">
          <span className="tonic-node">{state.context.tonic.name}</span>
          <span className="relation-line" />
          <span className="target-node">{revealed ? target.degreeLabel : "?"}</span>
        </div>
        <div>
          <p className="eyebrow">Scale-degree recognition</p>
          <h2>{revealed ? `${target.pitch.name} is degree ${target.degreeLabel}` : "What is the target relative to the tonic?"}</h2>
          <p>
            {revealed
              ? `The target sits ${target.semitonesFromTonic} semitones above the tonal centre. Sing it before replaying.`
              : "Listen for stability, direction, and distance rather than guessing a note name."}
          </p>
        </div>
        <div className="action-row">
          <button
            className="primary-button"
            onClick={() =>
              playAgainstTonic(
                state.context.tonic.pitchClass,
                target.pitch.pitchClass
              )
            }
          >
            Play prompt
          </button>
          {!revealed ? (
            <button className="secondary-button" onClick={() => setRevealed(true)}>
              Reveal relationship
            </button>
          ) : (
            <button className="secondary-button" onClick={next}>
              Next relationship
            </button>
          )}
        </div>
      </section>
    </div>
  );
}
