import { CURRICULUM, availableConcepts } from "../learning/curriculum";
import type { WorkspaceProps } from "./types";

export function Learn({ state, dispatch }: WorkspaceProps) {
  const available = availableConcepts(state.completedConcepts, state.depth);
  const next =
    CURRICULUM.find(
      (concept) =>
        !state.completedConcepts.includes(concept.id) &&
        concept.prerequisites.every((id) => state.completedConcepts.includes(id))
    ) ?? CURRICULUM[0];
  const percent = Math.round(
    (state.completedConcepts.length / CURRICULUM.length) * 100
  );

  return (
    <div className="workspace-stack">
      <section className="panel learning-hero">
        <div>
          <p className="eyebrow">Relationship pathway</p>
          <h1>Learn music as connected meaning.</h1>
          <p>
            Every activity moves through the same loop: hear it, locate it, name its
            role, build it, move it, and apply it somewhere new.
          </p>
        </div>
        <div
          className="progress-orbit"
          style={{
            background: `radial-gradient(circle, var(--panel-strong) 55%, transparent 56%), conic-gradient(var(--degree) 0 ${percent}%, var(--panel-muted) ${percent}% 100%)`
          }}
        >
          <strong>{percent}%</strong>
          <span>concept graph</span>
        </div>
      </section>

      <section className="panel next-concept">
        <div>
          <p className="eyebrow">Recommended next</p>
          <h2>{next.title}</h2>
          <p>{next.outcome}</p>
        </div>
        <div className="activity-callout">
          <span>Activity</span>
          <strong>{next.activity}</strong>
        </div>
        <div className="action-row">
          <button
            className="primary-button"
            onClick={() =>
              dispatch({
                type: "patch",
                patch: { workspace: next.workspace }
              })
            }
          >
            Open workspace
          </button>
          <button
            className="secondary-button"
            onClick={() => dispatch({ type: "completeConcept", id: next.id })}
          >
            Record checkpoint
          </button>
        </div>
      </section>

      <section className="concept-map">
        {available.map((concept, index) => {
          const completed = state.completedConcepts.includes(concept.id);
          return (
            <article className={`panel concept-card ${completed ? "is-complete" : ""}`} key={concept.id}>
              <div className="concept-index">{completed ? "✓" : index + 1}</div>
              <div>
                <span className={`level-tag level-${concept.level}`}>{concept.level}</span>
                <h3>{concept.title}</h3>
                <p>{concept.outcome}</p>
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
}
