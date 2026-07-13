import { useEffect, useState } from "react";
import { playRelationship } from "../audio/engine";
import { Fretboard } from "../components/Fretboard";
import { WorkspaceHeader } from "../components/WorkspaceHeader";
import { createExercise, createReviewExercise, dueSkills, skillAccuracy, skillLabel } from "../learning/engine";
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
  const [tries, setTries] = useState(0);
  const [resolved, setResolved] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const due = dueSkills(state.learning);
  const [reviewing, setReviewing] = useState(due.length > 0);
  const [reviewSkill, setReviewSkill] = useState<string | null>(due[0]?.skill ?? null);
  const reviewEvidence = reviewing && reviewSkill ? state.learning.skills[reviewSkill] ?? null : null;
  const prompt = reviewEvidence
    ? createReviewExercise(state.context, reviewEvidence, seed)
    : createExercise(state.context, kind, seed);
  const evidence = state.learning.skills[prompt.skill];

  useEffect(() => {
    setTries(0);
    setResolved(false);
    setSelected(null);
    setFeedback("Choose the answer that is true in the current tonal context.");
  }, [kind, seed, state.context, prompt.id]);

  const answer = (choice: string) => {
    if (resolved) return;
    const correct = choice === prompt.answer;
    dispatch({ type: "recordExercise", skill: prompt.skill, correct });
    setSelected(choice);
    if (correct) {
      setResolved(true);
      setFeedback(`Correct. ${prompt.explanation}`);
      return;
    }
    setTries((value) => value + 1);
    setFeedback("Not yet. Re-check the stated reference and compare the choices before trying again.");
  };
  const next = () => {
    if (reviewing) {
      const nextDue = due.find((item) => item.skill !== reviewSkill) ?? due[0] ?? null;
      setReviewSkill(nextDue?.skill ?? null);
      if (!nextDue) setReviewing(false);
    }
    setSeed((value) => value + 7);
  };

  return (
    <div className="workspace-stack">
      <WorkspaceHeader
        eyebrow="Adaptive practice"
        title="Retrieve relationships until they become usable."
        description="Every answer is stored by skill and context. Weak areas become visible instead of disappearing into one overall score."
        action={
          <button
            className="button secondary"
            disabled={!due.length}
            onClick={() => {
              setReviewing(true);
              setReviewSkill(due[0]?.skill ?? null);
              setSeed((value) => value + 1);
            }}
          >
            {due.length ? `${due.length} review${due.length === 1 ? "" : "s"} due` : "Nothing due"}
          </button>
        }
      />
      <section className="practice-layout">
        <aside className="panel practice-menu">
          <div className="section-label">Exercise family</div>
          {KINDS.map((item) => (
            <button className={kind === item.id ? "is-active" : ""} onClick={() => {
              setReviewing(false);
              setKind(item.id);
              setSeed((value) => value + 1);
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
          {reviewEvidence && <div className="due-badge">Spaced review · {skillLabel(reviewEvidence.skill)}</div>}
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
            {prompt.choices.map((choice) => (
              <button
                className={[
                  selected === choice ? "is-selected" : "",
                  resolved && choice === prompt.answer ? "is-correct" : ""
                ].filter(Boolean).join(" ")}
                disabled={resolved}
                onClick={() => answer(choice)}
                key={choice}
              >
                {choice}
              </button>
            ))}
          </div>
          <p className="feedback" aria-live="polite">{feedback}</p>
          {!resolved && tries >= 2 && (
            <button
              className="text-button"
              onClick={() => {
                setResolved(true);
                setFeedback(`Answer: ${prompt.answer}. ${prompt.explanation}`);
              }}
            >
              Show the worked explanation
            </button>
          )}
          {resolved && <button className="button primary" onClick={next}>Next relationship</button>}
        </section>
      </section>
    </div>
  );
}
