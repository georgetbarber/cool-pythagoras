import { LESSONS } from "../content/catalog";
import { WorkspaceHeader } from "../components/WorkspaceHeader";
import { recommendedLesson } from "../learning/engine";
import type { FeatureProps } from "./types";

export function Learn(props: FeatureProps) {
  const { state, dispatch } = props;
  const active = LESSONS.find((lesson) => lesson.id === state.learning.currentLessonId);
  const recommendation = recommendedLesson(state.profile, state.learning);

  if (active) {
    const step = active.steps[state.learning.currentLessonStep] ?? active.steps[0];
    const finalStep = state.learning.currentLessonStep === active.steps.length - 1;
    return (
      <div className="workspace-stack">
        <WorkspaceHeader
          eyebrow={`${active.kind} lesson · ${active.minutes} minutes`}
          title={active.title}
          description={active.outcome}
          action={<button className="button ghost" onClick={() => dispatch({ type: "cancelLesson" })}>Exit lesson</button>}
        />
        <section className="panel lesson-runner">
          <div className="lesson-progress" aria-label={`Step ${state.learning.currentLessonStep + 1} of ${active.steps.length}`}>
            {active.steps.map((item, index) => (
              <span className={index <= state.learning.currentLessonStep ? "is-complete" : ""} key={item.title} />
            ))}
          </div>
          <div className="lesson-step">
            <div className={`action-badge action-${step.action}`}>{step.action}</div>
            <small>Step {state.learning.currentLessonStep + 1} of {active.steps.length}</small>
            <h2>{step.title}</h2>
            <p>{step.body}</p>
            <blockquote>{step.prompt}</blockquote>
          </div>
          <div className="lesson-actions">
            <button
              className="button secondary"
              disabled={state.learning.currentLessonStep === 0}
              onClick={() => dispatch({ type: "setLessonStep", step: state.learning.currentLessonStep - 1 })}
            >
              Previous
            </button>
            {finalStep ? (
              <button
                className="button primary"
                onClick={() => dispatch({ type: "completeLesson", id: active.id, minutes: active.minutes })}
              >
                Complete lesson
              </button>
            ) : (
              <button
                className="button primary"
                onClick={() => dispatch({ type: "setLessonStep", step: state.learning.currentLessonStep + 1 })}
              >
                Next relationship
              </button>
            )}
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="workspace-stack">
      <WorkspaceHeader
        eyebrow="Guided curriculum"
        title="Learn relationships in an order that makes them usable."
        description="Knowledge lessons explain and test concepts. Play-along lessons turn the same ideas into timed musical action."
        action={<button className="button primary" onClick={() => dispatch({ type: "startLesson", id: recommendation.id })}>Recommended next</button>}
      />
      <div className="lesson-filters">
        <span>{LESSONS.filter((lesson) => lesson.kind === "knowledge").length} knowledge lessons</span>
        <span>{LESSONS.filter((lesson) => lesson.kind === "play-along").length} play-along lessons</span>
        <span>{state.learning.completedLessons.length} completed</span>
      </div>
      <div className="lesson-grid">
        {LESSONS.map((lesson) => {
          const complete = state.learning.completedLessons.includes(lesson.id);
          const locked = !lesson.prerequisites.every((id) => state.learning.completedLessons.includes(id));
          return (
            <article className={`panel lesson-card ${complete ? "is-complete" : ""}`} key={lesson.id}>
              <div className="lesson-card-meta">
                <span>{lesson.kind}</span>
                <small>{lesson.level} · {lesson.minutes} min</small>
              </div>
              <h2>{lesson.title}</h2>
              <p>{lesson.outcome}</p>
              <div className="lesson-tags"><span>{lesson.focus}</span></div>
              <button
                className="button secondary"
                disabled={locked}
                onClick={() => dispatch({ type: "startLesson", id: lesson.id })}
              >
                {complete ? "Review" : locked ? "Complete prerequisites" : "Start lesson"}
              </button>
            </article>
          );
        })}
      </div>
    </div>
  );
}
