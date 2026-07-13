import { CURRICULUM, STAGES } from "../curriculum";
import { unitProgress } from "../learning";
import { useV8Store } from "../store";

export function Path() {
  const { state, dispatch } = useV8Store();
  const active = CURRICULUM.find((unit) => unit.id === state.activeUnitId) ?? CURRICULUM[0];
  return (
    <div className="page-stack">
      <header className="page-header"><div><span className="eyebrow">Competency-paced path</span><h1>Build freedom in connected layers.</h1><p>Forty-eight units form a year-scale path, but dates never gate progress. Secure relationships transfer into new keys, neck regions, tempos and creative contexts.</p></div><div className="path-total"><strong>{CURRICULUM.filter((unit) => unitProgress(state, unit.id) === 100).length}</strong><span>of 48 units</span></div></header>
      <div className="path-layout">
        <nav className="stage-list card" aria-label="Curriculum stages">
          {STAGES.map((stage, index) => {
            const units = CURRICULUM.filter((unit) => unit.stage === index + 1);
            const progress = Math.round(units.reduce((sum, unit) => sum + unitProgress(state, unit.id), 0) / units.length);
            return <button className={active.stage === index + 1 ? "is-active" : ""} key={stage.title} onClick={() => dispatch({ type: "openUnit", unitId: units.find((unit) => unitProgress(state, unit.id) < 100)?.id ?? units[0].id })}><span>{String(index + 1).padStart(2, "0")}</span><div><strong>{stage.title}</strong><small>{stage.purpose}</small></div><b>{progress}%</b></button>;
          })}
        </nav>
        <section className="unit-stage">
          <header><span className="eyebrow">Stage {active.stage} · {STAGES[active.stage - 1].title}</span><h2>{STAGES[active.stage - 1].purpose}</h2></header>
          <div className="unit-grid">
            {CURRICULUM.filter((unit) => unit.stage === active.stage).map((unit) => {
              const progress = unitProgress(state, unit.id);
              const locked = unit.prerequisiteIds.some((id) => unitProgress(state, id) < 100) && unit.order > active.order + 1;
              return <article className={`unit-card card ${unit.id === active.id ? "is-active" : ""}`} key={unit.id}><div className="unit-number"><span>{unit.order}</span><i style={{ "--progress": `${progress}%` } as React.CSSProperties} /></div><h3>{unit.title}</h3><p>{unit.outcome}</p><div className="competency-tags">{unit.competencyIds.map((id) => <span key={id}>{id.split(":")[0]}</span>)}</div><button disabled={locked} className="secondary-action" onClick={() => dispatch({ type: "openUnit", unitId: unit.id })}>{locked ? "Build the prerequisite first" : progress ? "Continue unit" : "Open unit"}</button></article>;
            })}
          </div>
          <section className="unit-detail card">
            <header><div><span className="eyebrow">Unit {active.order} · {unitProgress(state, active.id)}% complete</span><h2>{active.title}</h2><p>{active.outcome}</p></div><strong>{active.microStudy.title}</strong></header>
            <ol className="activity-list">{active.activities.map((activity, index) => <li className={state.completedActivityIds.includes(activity.id) ? "is-complete" : ""} key={activity.id}><button onClick={() => dispatch({ type: "openActivity", activityId: activity.id })}><span>{state.completedActivityIds.includes(activity.id) ? "✓" : index + 1}</span><div><strong>{activity.title}</strong><small>{activity.kind.replaceAll("-", " ")} · {activity.minutes} min</small></div><b>Open</b></button></li>)}</ol>
          </section>
        </section>
      </div>
    </div>
  );
}
