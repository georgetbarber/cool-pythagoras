import { useState } from "react";
import { playRelationship } from "../audio/engine";
import { WorkspaceHeader } from "../components/WorkspaceHeader";
import { createExercise } from "../learning/engine";
import type { FeatureProps } from "./types";

export function Ear({ state }: FeatureProps) {
  const [seed, setSeed] = useState(2);
  const [revealed, setRevealed] = useState(false);
  const prompt = createExercise(state.context, "interval-name", seed);
  const next = () => {
    setSeed((value) => value + 5);
    setRevealed(false);
  };
  return (
    <div className="workspace-stack">
      <WorkspaceHeader
        eyebrow="Contextual ear"
        title="Hear every sound against a reference."
        description="The tonic sounds before and after the target so you learn a relationship rather than an isolated pitch."
      />
      <section className="panel ear-room">
        <div className="ear-graphic">
          <span>{state.context.tonicName}</span>
          <i />
          <span>{revealed ? prompt.answer.split(" · ")[0] : "?"}</span>
        </div>
        <div className="section-label">Tonic · target · tonic</div>
        <h2>{revealed ? prompt.answer : "What relationship did you hear?"}</h2>
        <p>{revealed ? prompt.supportingText : "Listen for distance, stability, colour, and likely direction."}</p>
        <div className="ear-actions">
          <button className="button primary" onClick={() => playRelationship(state.context.tonic, prompt.audioTarget ?? state.context.tonic)}>
            Play prompt
          </button>
          <button className="button secondary" onClick={() => {
            if (revealed) next();
            else {
              setRevealed(true);
            }
          }}>
            {revealed ? "Next sound" : "Reveal relationship"}
          </button>
        </div>
      </section>
    </div>
  );
}
