import { buildSession, nextUnit, pathSummary, unitProgress } from "../learning";
import { useV8Store } from "../store";

export function Today() {
  const { state, dispatch, navigate } = useV8Store();
  const session = buildSession(state);
  const unit = nextUnit(state);
  const summary = pathSummary(state);
  const currentProject = state.sketches.find((sketch) => sketch.id === state.activeSketchId) ?? state.sketches.at(-1);
  const firstUnfinished = session.items.find((item) => !state.completedActivityIds.includes(item.activityId));
  const first = firstUnfinished ?? session.items[0];
  const sessionComplete = !firstUnfinished;
  return (
    <div className="page-stack today-page">
      <section className="today-focus">
        <div className="today-copy">
          <span className="eyebrow">Today · {state.settings.dailyMinutes} minute practice</span>
          <h1>Turn one relationship into music.</h1>
          <p>{session.purpose}</p>
          <div className="today-meta"><span>{unit.title}</span><span>{state.settings.instrument}</span><span>{state.settings.tonicName} {state.settings.mode}</span></div>
          {sessionComplete
            ? <button className="primary-action large" onClick={() => navigate("path")}>Today’s session is complete — explore your Path</button>
            : <button className="primary-action large" onClick={() => dispatch({ type: "openActivity", activityId: first.activityId })}>Start with: {first.title}</button>}
        </div>
        <div className="session-ring" aria-label={`${unitProgress(state, unit.id)} percent of unit complete`}><strong>{unitProgress(state, unit.id)}%</strong><span>unit complete</span></div>
      </section>

      <section className="session-plan card">
        <header><div><span className="eyebrow">Balanced session</span><h2>{session.title}</h2></div><strong>{session.totalMinutes} min</strong></header>
        <ol>
          {session.items.map((item, index) => {
            const complete = state.completedActivityIds.includes(item.activityId);
            return <li className={complete ? "is-complete" : ""} key={`${item.activityId}-${index}`}><button onClick={() => dispatch({ type: "openActivity", activityId: item.activityId })}><span>{complete ? "✓" : index + 1}</span><div><strong>{item.title}</strong><small>{item.purpose}</small></div><b>{item.minutes}m</b></button></li>;
          })}
        </ol>
      </section>

      <div className="today-lower">
        <section className="card project-glance">
          <span className="eyebrow">Current creative work</span>
          {currentProject ? <><h2>{currentProject.name}</h2><p>{currentProject.intention}</p><div className="workflow-mini"><span>{currentProject.status}</span><span>{currentProject.revisions.length} revisions</span><span>{currentProject.takes.length} takes</span></div><button className="secondary-action" onClick={() => { dispatch({ type: "setActiveSketch", id: currentProject.id }); navigate("create"); }}>Continue the sketch</button></> : <><h2>Your first musical sketch</h2><p>Capture two bars before they feel finished. Understanding can follow the sound.</p><button className="secondary-action" onClick={() => dispatch({ type: "createSketch" })}>Create a sketch</button></>}
        </section>
        <section className="card reflection-glance">
          <span className="eyebrow">Learning evidence</span>
          <h2>{summary.completedUnits} of {summary.totalUnits} units complete</h2>
          <p>{state.lastReflection || "After today’s playing, record one specific observation about sound, time, movement or intention."}</p>
          <div className="artifact-stats"><span><strong>{summary.created}</strong> created</span><span><strong>{summary.revised}</strong> revised</span><span><strong>{summary.finished}</strong> finished</span></div>
        </section>
      </div>
    </div>
  );
}
