import { useEffect, useMemo, useState } from "react";
import { playRelationship, playVoicing } from "../audio/engine";
import { Fretboard } from "../components/Fretboard";
import { WorkspaceHeader } from "../components/WorkspaceHeader";
import { createExercise, createReviewExercise, dueSkills, skillAccuracy, skillLabel } from "../learning/engine";
import { createCoachPrompt } from "../learning/practiceCoach";
import type { CoachDifficulty, CoachMode } from "../learning/practiceCoach";
import type { ExerciseKind } from "../learning/types";
import type { FeatureProps } from "./types";

const COACH_MODES: Array<{
  id: CoachMode;
  label: string;
  description: string;
  focus: string;
}> = [
  {
    id: "mixed",
    label: "Mixed coach",
    description: "A varied, endless session that moves between geography, intervals, chord tones, and triads.",
    focus: "Best daily choice"
  },
  {
    id: "note-hunt",
    label: "Note hunt",
    description: "Find one pitch everywhere in a useful fret range and connect octave landmarks.",
    focus: "Fretboard geography"
  },
  {
    id: "interval-move",
    label: "Interval moves",
    description: "Hold a physical root and play the same relationship across different string pairs.",
    focus: "Movable shapes"
  },
  {
    id: "chord-tone",
    label: "Chord-tone targets",
    description: "Play the active chord, then land deliberately on its third, fifth, or seventh.",
    focus: "Harmony-aware phrasing"
  },
  {
    id: "triad-shape",
    label: "Triad shapes",
    description: "Find compact inversions on named string sets and hear the bass relationship.",
    focus: "Playable harmony"
  }
];

const DIFFICULTIES: Array<{ id: CoachDifficulty; label: string; description: string }> = [
  { id: "foundation", label: "Foundation", description: "Open position to fret 5" },
  { id: "moving", label: "Moving", description: "Across frets 0-9" },
  { id: "challenge", label: "Challenge", description: "Full neck and chromatic colour" }
];

const QUIZ_KINDS: Array<{ id: ExerciseKind; label: string; description: string }> = [
  { id: "scale-degree", label: "Scale degrees", description: "Name notes relative to the tonal centre." },
  { id: "interval-name", label: "Intervals", description: "Connect semitone distance, label, and sound." },
  { id: "chord-function", label: "Chord function", description: "Identify stability, preparation, and tension." },
  { id: "roman-numeral", label: "Roman numerals", description: "Translate chord names into portable relationships." },
  { id: "fretboard-note", label: "Fretboard notes", description: "Recover note identity from string and fret." }
];

interface SessionStats {
  attempts: number;
  correct: number;
  streak: number;
  bestStreak: number;
}

const EMPTY_STATS: SessionStats = { attempts: 0, correct: 0, streak: 0, bestStreak: 0 };

export function Practice(props: FeatureProps) {
  const { state, dispatch, model } = props;
  const [mode, setMode] = useState<CoachMode>("mixed");
  const [difficulty, setDifficulty] = useState<CoachDifficulty>("foundation");
  const [running, setRunning] = useState(false);
  const [seed, setSeed] = useState(23);
  const [hintVisible, setHintVisible] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [assessed, setAssessed] = useState<boolean | null>(null);
  const [stats, setStats] = useState<SessionStats>(EMPTY_STATS);
  const [lastSummary, setLastSummary] = useState<SessionStats | null>(null);
  const prompt = useMemo(
    () => createCoachPrompt(state.context, model.scale, model.activeChord, mode, difficulty, seed),
    [state.context, model.scale, model.activeChord, mode, difficulty, seed]
  );

  useEffect(() => {
    setHintVisible(false);
    setRevealed(false);
    setAssessed(null);
  }, [prompt.id]);

  const start = (nextMode: CoachMode) => {
    setMode(nextMode);
    setRunning(true);
    setSeed((value) => value + 11);
    setStats(EMPTY_STATS);
    setLastSummary(null);
  };
  const next = () => {
    setSeed((value) => value + 13);
  };
  const assess = (correct: boolean) => {
    if (assessed !== null) return;
    dispatch({ type: "recordExercise", skill: prompt.skill, correct });
    setAssessed(correct);
    setStats((current) => {
      const streak = correct ? current.streak + 1 : 0;
      return {
        attempts: current.attempts + 1,
        correct: current.correct + Number(correct),
        streak,
        bestStreak: Math.max(current.bestStreak, streak)
      };
    });
  };
  const stop = () => {
    setLastSummary(stats);
    setRunning(false);
    setRevealed(false);
    setAssessed(null);
  };
  const hearPrompt = () => {
    if (prompt.shape) {
      playVoicing(prompt.shape.positions.map((position) => position.midi));
      return;
    }
    const root = prompt.rootPosition?.pitchClass ?? state.context.tonic;
    playRelationship(root, prompt.audioTarget ?? root);
  };

  return (
    <div className="workspace-stack">
      <WorkspaceHeader
        eyebrow="Guitar practice coach"
        title={running ? prompt.title : "Pick up the guitar. The coach will keep going."}
        description={running
          ? "Play first, use a hint only when useful, then reveal and assess honestly. There is no fixed ending."
          : "Start an ongoing session built around physical playing. Prompts change, but every answer stays connected to a root, key, chord, or shape."}
        action={running
          ? <button className="button secondary" onClick={stop}>Stop session</button>
          : <button className="button primary" onClick={() => start("mixed")}>Start mixed coach</button>}
      />

      {!running ? (
        <>
          <section className="panel coach-setup">
            <div className="panel-heading">
              <div>
                <div className="section-label">Session difficulty</div>
                <h2>Choose how much neck to use.</h2>
                <p>Difficulty changes fret range and relationship variety, not the value of the exercise.</p>
              </div>
              <div className="difficulty-picker">
                {DIFFICULTIES.map((item) => (
                  <button
                    className={difficulty === item.id ? "is-active" : ""}
                    onClick={() => setDifficulty(item.id)}
                    key={item.id}
                  >
                    <strong>{item.label}</strong>
                    <small>{item.description}</small>
                  </button>
                ))}
              </div>
            </div>
            {lastSummary && lastSummary.attempts > 0 && (
              <div className="session-summary" aria-live="polite">
                <strong>Last session: {lastSummary.correct}/{lastSummary.attempts} felt secure</strong>
                <span>Best run {lastSummary.bestStreak}. Revisit misses slowly before increasing difficulty.</span>
              </div>
            )}
            <div className="coach-mode-grid">
              {COACH_MODES.map((item) => (
                <article className="coach-mode-card" key={item.id}>
                  <small>{item.focus}</small>
                  <h2>{item.label}</h2>
                  <p>{item.description}</p>
                  <button className={item.id === "mixed" ? "button primary" : "button secondary"} onClick={() => start(item.id)}>
                    Start ongoing session
                  </button>
                </article>
              ))}
            </div>
          </section>
          <TheoryCheck {...props} />
        </>
      ) : (
        <section className="coach-session-layout">
          <aside className="panel coach-session-rail">
            <div className="section-label">Live session</div>
            <strong>{COACH_MODES.find((item) => item.id === mode)?.label}</strong>
            <span>{DIFFICULTIES.find((item) => item.id === difficulty)?.description}</span>
            <div className="coach-stat-grid">
              <article><strong>{stats.attempts ? Math.round((stats.correct / stats.attempts) * 100) : 0}%</strong><small>secure</small></article>
              <article><strong>{stats.streak}</strong><small>current run</small></article>
              <article><strong>{stats.bestStreak}</strong><small>best run</small></article>
            </div>
            <label>
              Difficulty
              <select value={difficulty} onChange={(event) => {
                setDifficulty(event.target.value as CoachDifficulty);
                next();
              }}>
                {DIFFICULTIES.map((item) => <option value={item.id} key={item.id}>{item.label}</option>)}
              </select>
            </label>
            <button className="text-button" onClick={stop}>Finish and review</button>
          </aside>

          <article className="panel coach-prompt-card">
            <div className="prompt-meta">
              <span>{COACH_MODES.find((item) => item.id === prompt.mode)?.label}</span>
              <span>{state.context.tonicName} {state.context.mode}</span>
              <span>{model.activeChord.roman} · {model.activeChord.symbol}</span>
            </div>
            <div className="section-label">Try this now</div>
            <h2>{prompt.instruction}</h2>
            <p className="prompt-setup">{prompt.setup}</p>
            <div className="coach-prompt-actions">
              <button className="button secondary" onClick={hearPrompt}>Hear reference</button>
              <button className="button secondary" onClick={() => setHintVisible((value) => !value)}>
                {hintVisible ? "Hide hint" : "Use a hint"}
              </button>
              <button className="button primary" onClick={() => setRevealed(true)} disabled={revealed}>Reveal answer</button>
            </div>
            {hintVisible && <p className="coach-hint"><strong>Hint:</strong> {prompt.hint}</p>}
            {!revealed ? (
              <div className="play-first">
                <strong>Play before looking.</strong>
                <span>Say the relationship aloud, then check the neck map when you are ready.</span>
              </div>
            ) : (
              <div className="coach-reveal">
                <div>
                  <div className="section-label">Answer</div>
                  <strong>{prompt.answer}</strong>
                  <p>{prompt.explanation}</p>
                </div>
                <Fretboard
                  scale={model.scale}
                  chord={prompt.chord ?? model.activeChord}
                  shape={prompt.shape}
                  selectedPitch={prompt.targetPitch}
                  selectedPosition={prompt.rootPosition}
                  relationshipRoot={prompt.rootPosition?.pitchClass}
                  targetInterval={prompt.targetInterval}
                  visible="targets"
                  fretStart={prompt.fretStart}
                  fretEnd={prompt.fretEnd}
                />
                <p className="why-card"><strong>Why this matters</strong>{prompt.whyItMatters}</p>
                {assessed === null ? (
                  <div className="assessment-actions">
                    <button className="button secondary" onClick={() => assess(false)}>Needs another pass</button>
                    <button className="button primary" onClick={() => assess(true)}>Got it cleanly</button>
                  </div>
                ) : (
                  <div className={`assessment-feedback ${assessed ? "is-secure" : "is-retry"}`}>
                    <span>{assessed ? "Secure for now. Transfer it to the next prompt." : "Good diagnosis. Slow it down and revisit this relationship soon."}</span>
                    <button className="button primary" onClick={next}>Next prompt</button>
                  </div>
                )}
              </div>
            )}
          </article>
        </section>
      )}
    </div>
  );
}

function TheoryCheck({ state, dispatch, model }: FeatureProps) {
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
    <details className="panel theory-check">
      <summary>
        <span><strong>Theory quick checks</strong><small>Keep multiple-choice retrieval and spaced review available.</small></span>
        <b>{due.length ? `${due.length} due` : "Optional"}</b>
      </summary>
      <div className="practice-layout">
        <aside className="practice-menu">
          <div className="section-label">Exercise family</div>
          {QUIZ_KINDS.map((item) => (
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
        <section className="practice-card">
          <div className="practice-metric">
            <strong>{skillAccuracy(evidence)}%</strong>
            <span>this skill</span>
            <small>{evidence?.attempts ?? 0} attempts</small>
          </div>
          <div className="section-label">{QUIZ_KINDS.find((item) => item.id === kind)?.label}</div>
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
      </div>
    </details>
  );
}
