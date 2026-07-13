import { useEffect, useState } from "react";
import { playHarmonicRelationship, playMelodicRelationship, stopAudio } from "../audio/engine";
import { WorkspaceHeader } from "../components/WorkspaceHeader";
import { createExercise } from "../learning/engine";
import type { FeatureProps } from "./types";

export function Ear({ state, dispatch }: FeatureProps) {
  const [seed, setSeed] = useState(2);
  const [kind, setKind] = useState<"interval-name" | "scale-degree">("interval-name");
  const [played, setPlayed] = useState(false);
  const [tries, setTries] = useState(0);
  const [resolved, setResolved] = useState(false);
  const [feedback, setFeedback] = useState("Play the prompt before choosing a symbol.");
  const prompt = createExercise(state.context, kind, seed);
  const next = () => {
    setSeed((value) => value + 5);
    setPlayed(false);
    setTries(0);
    setResolved(false);
    setFeedback("Play the prompt before choosing a symbol.");
  };
  const answer = (choice: string) => {
    if (!played || resolved) return;
    const correct = choice === prompt.answer;
    dispatch({ type: "recordExercise", skill: prompt.skill, correct });
    if (correct) {
      setResolved(true);
      setFeedback(`Correct. ${prompt.explanation}`);
    } else {
      setTries((value) => value + 1);
      setFeedback("Not yet. Re-hear the tonic and compare distance, colour, and direction.");
    }
  };
  const target = prompt.audioTarget ?? state.context.tonic;
  useEffect(() => {
    setPlayed(false);
    setTries(0);
    setResolved(false);
    setFeedback("Play the prompt before choosing a symbol.");
    stopAudio();
  }, [state.context]);
  useEffect(() => () => stopAudio(), []);

  return (
    <div className="workspace-stack">
      <WorkspaceHeader
        eyebrow="Contextual ear"
        title="Hear every sound against a reference."
        description="The tonic sounds before and after the target so you learn a relationship rather than an isolated pitch."
      />
      <section className="panel ear-room">
        <div className="ear-mode-picker">
          <button className={kind === "interval-name" ? "is-active" : ""} onClick={() => {
            setKind("interval-name");
            next();
          }}>Intervals</button>
          <button className={kind === "scale-degree" ? "is-active" : ""} onClick={() => {
            setKind("scale-degree");
            next();
          }}>Scale degrees</button>
        </div>
        <div className="ear-graphic">
          <span>{state.context.tonicName}</span>
          <i />
          <span>{resolved ? prompt.answer.split(" · ")[0] : "?"}</span>
        </div>
        <div className="section-label">Sound before symbol</div>
        <h2>{resolved ? prompt.answer : `Which ${kind === "interval-name" ? "interval" : "scale degree"} did you hear?`}</h2>
        <p>{resolved ? prompt.explanation : "Listen for distance, stability, colour, and likely direction before naming it."}</p>
        <div className="ear-actions">
          <button className="button primary" onClick={() => {
            setPlayed(true);
            playMelodicRelationship(state.context.tonic, target);
          }}>
            Hear melodic
          </button>
          <button className="button secondary" onClick={() => {
            setPlayed(true);
            playHarmonicRelationship(state.context.tonic, target);
          }}>
            Hear together
          </button>
        </div>
        <div className="answer-grid ear-answer-grid">
          {prompt.choices.map((choice) => (
            <button disabled={!played || resolved} onClick={() => answer(choice)} key={choice}>{choice}</button>
          ))}
        </div>
        <p className="feedback" aria-live="polite">{feedback}</p>
        {!resolved && tries >= 2 && (
          <button className="text-button" onClick={() => {
            setResolved(true);
            setFeedback(`Answer: ${prompt.answer}. ${prompt.explanation}`);
          }}>
            Reveal after comparison
          </button>
        )}
        {resolved && <button className="button primary" onClick={next}>Next sound</button>}
      </section>
    </div>
  );
}
