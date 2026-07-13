import { useState } from "react";
import { LESSONS } from "../../content/lessons";
import type { DashboardState } from "../../state/dashboardState";

interface LessonsProps {
  state: DashboardState;
  completeLesson: (lessonId: string) => void;
}

export function Lessons({ state, completeLesson }: LessonsProps) {
  const [openLesson, setOpenLesson] = useState(LESSONS[0].id);
  return (
    <div className="feature-page">
      <section className="panel feature-header">
        <div>
          <p className="eyebrow">Guided curriculum</p>
          <h1>Lesson Paths</h1>
          <p>
            {state.completedLessons.length} of {LESSONS.length} checkpoints complete.
          </p>
        </div>
        <div className="progress-meter" aria-label="Course progress">
          <span
            style={{
              width: `${(state.completedLessons.length / LESSONS.length) * 100}%`
            }}
          />
        </div>
      </section>
      <div className="lesson-grid">
        {LESSONS.map((lesson, index) => {
          const completed = state.completedLessons.includes(lesson.id);
          const open = openLesson === lesson.id;
          return (
            <article className={`panel lesson-card ${open ? "is-open" : ""}`} key={lesson.id}>
              <button className="lesson-heading" onClick={() => setOpenLesson(lesson.id)}>
                <span className={completed ? "lesson-number is-complete" : "lesson-number"}>
                  {completed ? "Done" : index + 1}
                </span>
                <span>
                  <strong>{lesson.title}</strong>
                  <small>{lesson.summary}</small>
                </span>
              </button>
              {open && (
                <div className="lesson-body">
                  {lesson.body.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                  <div className="checkpoint">
                    <span>Checkpoint</span>
                    <strong>{lesson.checkpoint}</strong>
                  </div>
                  <button
                    className={completed ? "secondary-button" : "primary-button"}
                    onClick={() => completeLesson(lesson.id)}
                    disabled={completed}
                  >
                    {completed ? "Checkpoint complete" : "Mark checkpoint complete"}
                  </button>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}
