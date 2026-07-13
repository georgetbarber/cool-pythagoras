import { HelpButton } from "../components/HelpButton";
import { Fretboard } from "../components/Fretboard";
import { RelationshipPanel } from "../components/RelationshipPanel";
import { WorkspaceHeader } from "../components/WorkspaceHeader";
import { HELP } from "../content/catalog";
import { recommendedLesson, skillAccuracy, weakestSkills } from "../learning/engine";
import type { FeatureProps } from "./types";

export function Dashboard(props: FeatureProps) {
  const { state, dispatch, model } = props;
  const recommendation = recommendedLesson(state.profile, state.learning);
  const weak = weakestSkills(state.learning);
  return (
    <div className="workspace-stack">
      <WorkspaceHeader
        eyebrow="Relationship dashboard"
        title="See the musical network, then choose one thing to learn."
        description={`The reference remains ${state.context.tonicName}. Notes, chords, shapes, sounds, and progressions are different views of the same relationships.`}
        action={
          <button className="button primary" onClick={() => dispatch({ type: "startLesson", id: recommendation.id })}>
            Continue: {recommendation.title}
          </button>
        }
      />

      <div className="dashboard-summary">
        <section className="panel summary-card">
          <small>Current focus</small>
          <strong>{model.activeChord.roman} · {model.activeChord.symbol}</strong>
          <span>{model.activeChord.functionLabel}</span>
          <p>{model.activeChord.explanation}</p>
        </section>
        <section className="panel summary-card">
          <small>Learning plan</small>
          <strong>{state.profile.dailyMinutes} minutes</strong>
          <span>{state.profile.practiceMode.replace("-", " ")}</span>
          <p>{state.profile.focuses.join(" · ")}</p>
        </section>
        <section className="panel summary-card">
          <small>Progress</small>
          <strong>{state.learning.completedLessons.length} lessons</strong>
          <span>{state.learning.totalPracticeMinutes} practice minutes</span>
          <p>{weak.length ? `Review: ${weak.map((skill) => skill.skill).join(", ")}` : "Complete practice prompts to build a mastery picture."}</p>
        </section>
      </div>

      <section className="panel network-overview">
        <div className="panel-heading">
          <div>
            <div className="section-label">Scale to harmony</div>
            <h2>Chords emerge from scale degrees</h2>
            <p>Select any degree or chord and watch its relationships update everywhere.</p>
          </div>
          <HelpButton {...HELP.function} />
        </div>
        <div className="scale-ribbon">
          {model.scale.map((tone) => (
            <button
              className={tone.pitchClass === state.selectedPitch ? "is-active" : ""}
              onClick={() => dispatch({ type: "selectPitch", pitchClass: tone.pitchClass })}
              key={tone.degree}
            >
              <small>D{tone.degreeLabel}</small>
              <strong>{tone.name}</strong>
              <span>{tone.intervalName}</span>
            </button>
          ))}
        </div>
        <div className="chord-ribbon">
          {model.chords.map((chord) => (
            <button
              className={chord.degree === model.activeChord.degree ? "is-active" : ""}
              onClick={() => dispatch({ type: "selectChord", degree: chord.degree })}
              key={chord.id}
            >
              <small>{chord.roman}</small>
              <strong>{chord.symbol}</strong>
              <span>{chord.functionLabel}</span>
            </button>
          ))}
        </div>
      </section>

      <div className="dashboard-grid">
        <section className="panel fretboard-panel">
          <div className="panel-heading">
            <div>
              <div className="section-label">Fretboard overview</div>
              <h2>{model.activeChord.symbol} inside {state.context.tonicName} {state.context.mode}</h2>
              <p>Click one position. Every matching pitch remains related across the neck.</p>
            </div>
            <button className="text-button" onClick={() => dispatch({ type: "navigate", route: "fretboard" })}>
              Open interval lab
            </button>
          </div>
          <Fretboard
            scale={model.scale}
            chord={model.activeChord}
            selectedPitch={state.selectedPitch}
            selectedPosition={state.selectedPosition}
            labelMode={state.labelMode}
            onPosition={(position) => dispatch({ type: "selectPosition", ...position })}
          />
        </section>
        <RelationshipPanel {...props} />
      </div>

      <section className="panel review-strip">
        <div>
          <div className="section-label">Adaptive review</div>
          <h2>Practice what is least secure.</h2>
        </div>
        {weak.length ? weak.map((skill) => (
          <article key={skill.skill}>
            <strong>{skillAccuracy(skill)}%</strong>
            <span>{skill.skill}</span>
            <small>{skill.attempts} attempts</small>
          </article>
        )) : (
          <p>No evidence yet. The first practice session will begin building recommendations.</p>
        )}
        <button className="button secondary" onClick={() => dispatch({ type: "navigate", route: "practice" })}>
          Start adaptive practice
        </button>
      </section>
    </div>
  );
}
