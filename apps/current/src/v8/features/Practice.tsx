import { useMemo, useState } from "react";
import { ACTIVITIES } from "../curriculum";
import { masteryFor, masteryNextStep, recommendPractice } from "../learning";
import { useV8Store } from "../store";
import type { ActivityKind } from "../types";

const PRACTICE_MODES: Array<{ id: string; title: string; kinds: ActivityKind[]; purpose: string }> = [
  { id: "sound", title: "Sound and technique", kinds: ["technique"], purpose: "Control attack, release, muting, touch and unnecessary tension." },
  { id: "time", title: "Rhythm and groove", kinds: ["rhythm"], purpose: "Keep pulse alive through subdivisions, rests, accents and changes." },
  { id: "ear", title: "Ear to hand", kinds: ["listen-compare", "sing-predict"], purpose: "Predict, sing, imitate and find relationships before naming them." },
  { id: "map", title: "Fretboard transfer", kinds: ["relationship", "transfer"], purpose: "Move identities across strings, keys, registers and physical regions." },
  { id: "language", title: "Variation and phrasing", kinds: ["variation"], purpose: "Develop musical language by keeping one thing and changing another." },
  { id: "create", title: "Creative constraint", kinds: ["creative", "reflection"], purpose: "Make, listen, revise and preserve a small musical choice." }
];

export function Practice() {
  const { state, dispatch } = useV8Store();
  const [mode, setMode] = useState(PRACTICE_MODES[0].id);
  const selected = PRACTICE_MODES.find((item) => item.id === mode)!;
  const available = useMemo(() => ACTIVITIES.filter((activity) => selected.kinds.includes(activity.kind)), [selected]);
  const next = recommendPractice(available, state) ?? available[0];
  const competencyIds = [...new Set(state.evidence.map((item) => item.competencyId))];
  const mastery = competencyIds.map((id) => masteryFor(id, state.evidence));
  return (
    <div className="page-stack">
      <header className="page-header compact"><div><span className="eyebrow">Targeted practice</span><h1>Train the weakest link without losing the music.</h1><p>Within a focus area the recommendation is ranked by your own evidence — least independent mastery and most retries come first. Hints and reveals are kept separate; production, transfer and creation all count as evidence, not just accuracy.</p></div></header>
      <section className="practice-modes">
        {PRACTICE_MODES.map((item) => <button className={mode === item.id ? "is-active" : ""} onClick={() => setMode(item.id)} key={item.id}><span>{item.title}</span><small>{item.purpose}</small></button>)}
      </section>
      <section className="practice-focus card">
        <div><span className="eyebrow">Recommended next · {selected.title}</span><h2>{next.title}</h2><p>{next.why}</p><div className="competency-tags">{next.competencyIds.map((id) => <span key={id}>{id.split(":")[0]}</span>)}</div></div>
        <button className="primary-action" onClick={() => dispatch({ type: "openActivity", activityId: next.id })}>Start focused practice</button>
      </section>
      <section className="evidence-panel card">
        <header><div><span className="eyebrow">Evidence, not points</span><h2>Your developing relationships</h2></div><span>{state.evidence.length} observations</span></header>
        {mastery.length ? <div className="mastery-grid">{mastery.slice(-12).map((item) => <article key={item.competencyId}><strong>{item.competencyId.split(":")[0]}</strong><span className={`mastery-state state-${item.state}`}>{item.state.replace("-", " ")}</span><small>{item.successfulDays} independent days · {item.contextCount} contexts</small>{item.assistedAttempts > 0 && <small>{item.assistedAttempts} assisted attempt{item.assistedAttempts === 1 ? "" : "s"} kept separate</small>}<small className="mastery-next">{masteryNextStep(item)}</small></article>)}</div> : <p>No evidence yet. Begin with today’s session; the system will build a picture from actual attempts rather than clicks.</p>}
      </section>
    </div>
  );
}
