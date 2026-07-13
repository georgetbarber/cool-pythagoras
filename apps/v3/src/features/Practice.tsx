import { useState } from "react";
import { playAgainstTonic } from "../audio/engine";
import type { WorkspaceProps } from "./types";

export function Practice({ state, scale }: WorkspaceProps) {
  const [targetIndex, setTargetIndex] = useState(1);
  const [attempts, setAttempts] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [message, setMessage] = useState("Listen, then choose the scale degree.");
  const target = scale[targetIndex];

  const answer = (index: number) => {
    setAttempts((value) => value + 1);
    if (index === targetIndex) {
      setCorrect((value) => value + 1);
      setMessage(`Correct: ${target.pitch.name} is ${target.degreeLabel} relative to ${state.context.tonic.name}.`);
      let next = Math.floor(Math.random() * scale.length);
      if (next === targetIndex) next = (next + 2) % scale.length;
      setTargetIndex(next);
    } else {
      setMessage(
        `${scale[index].degreeLabel} would be ${scale[index].pitch.name}. Re-anchor to ${state.context.tonic.name} and listen again.`
      );
    }
  };

  return (
    <div className="workspace-stack">
      <section className="panel workspace-heading">
        <div>
          <p className="eyebrow">Adaptive practice</p>
          <h1>Retrieve meaning in context.</h1>
          <p>
            This first practice loop records evidence about scale-degree hearing.
            Later exercise families use the same concept and context model.
          </p>
        </div>
        <div className="metric-pair">
          <div><strong>{correct}</strong><span>correct</span></div>
          <div><strong>{attempts}</strong><span>attempts</span></div>
        </div>
      </section>
      <section className="panel practice-stage">
        <button
          className="listen-button"
          onClick={() =>
            playAgainstTonic(
              state.context.tonic.pitchClass,
              target.pitch.pitchClass
            )
          }
        >
          <span>▶</span>
          Hear prompt
        </button>
        <h2>Which scale degree did you hear?</h2>
        <div className="answer-grid">
          {scale.map((tone, index) => (
            <button onClick={() => answer(index)} key={tone.degree}>
              {tone.degreeLabel}
            </button>
          ))}
        </div>
        <p className="feedback">{message}</p>
      </section>
    </div>
  );
}
