import { useState } from "react";
import { playRelationship } from "../audio/engine";
import { Fretboard } from "../components/Fretboard";
import { WorkspaceHeader } from "../components/WorkspaceHeader";
import { createExercise, skillAccuracy } from "../learning/engine";
import type { ExerciseKind } from "../learning/types";
import type { FeatureProps } from "./types";

const KINDS: Array<{ id: ExerciseKind; label: string; description: string }> = [
  { id: "scale-degree", label: "Scale degrees", description: "Name notes relative to the tonal centre." },
  { id: "interval-name", label: "Intervals", description: "Connect semitone distance, label, and sound." },
  { id: "chord-function", label: "Chord function", description: "Identify stability, preparation, and tension." },
  { id: "roman-numeral", label: "Roman numerals", description: "Translate chord names into portable relationships." },
  { id: "fretboard-note", label: "Fretboard notes", description: "Recover note identity from string and fret." }
];

export function Practice({ state, dispatch, model }: FeatureProps) {
  const [kind, setKind] = useState<ExerciseKind>("scale-degree");
  const [seed, setSeed] = useState(11);
  const [feedback, setFeedback] = useState("Choose the answer that is true in the current tonal context.");
  const prompt = createExercise(state.context, kind, seed);
  const evidence = state.learning.skills[prompt.skill];
  const answer = (choice: string) => {
    const correct = choice === prompt.answer;
    dispatch({ type: "recordExercise", skill: prompt.skill, correct });
    setFeedback(correct
      ? `Correct. ${prompt.answer} is the relationship in this context.`
      : `${choice} is not the current relationship. The answer is ${prompt.answer}.`
    );
    if (correct) setSeed((value) => value + 7);
  };

  return (
    <div className="workspace-stack">
      <WorkspaceHeader
        eyebrow="Adaptive practice"
        title="Retrieve relationships until they become usable."
        description="Every answer is stored by skill and context. Weak areas become visible instead of disappearing into one overall score."
      />
      <section className="practice-layout">
        <aside className="panel practice-menu">
          <div className="section-label">Exercise family</div>
          {KINDS.map((item) => (
            <button className={kind === item.id ? "is-active" : ""} onClick={() => {
              setKind(item.id);
              setSeed((value) => value + 1);
              setFeedback(item.description);
            }} key={item.id}>
              <strong>{item.label}</strong>
              <small>{item.description}</small>
            </button>
          ))}
        </aside>
        <section className="panel practice-card">
          <div className="practice-metric">
            <strong>{skillAccuracy(evidence)}%</strong>
            <span>this skill</span>
            <small>{evidence?.attempts ?? 0} attempts</small>
          </div>
          <div className="section-label">{KINDS.find((item) => item.id === kind)?.label}</div>
          <h2>{prompt.question}</h2>
          <p>{prompt.supportingText}</p>
          {prompt.audioTarget !== undefined && (
            <button className="listen-button" onClick={() => playRelationship(state.context.tonic, prompt.audioTarget!)}>Hear relationship</button>
          )}
          {prompt.fretTarget && (
            <Fretboard
              scale={model.scale}
              chord={model.activeChord}
              selectedPosition={prompt.fretTarget}
              visible="all"
              fretStart={Math.max(0, prompt.fretTarget.fret - 2)}
              fretEnd={Math.min(15, prompt.fretTarget.fret + 2)}
            />
          )}
          <div className="answer-grid">
            {prompt.choices.map((choice) => <button onClick={() => answer(choice)} key={choice}>{choice}</button>)}
          </div>
          <p className="feedback" aria-live="polite">{feedback}</p>
        </section>
      </section>
    </div>
  );
}
