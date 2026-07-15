import { useMemo, useState } from "react";
import { ACTIVITIES, STAGES, unitById } from "../curriculum";
import { masteryFor, masteryNextStep, nextUnit, recommendPractice, recommendedPracticeStrand } from "../learning";
import { useV8Store } from "../store";
import type { ActivityDefinition, CompetencyStrand, MasteryState, V8State } from "../types";

interface SkillFocus {
  strand: CompetencyStrand;
  title: string;
  purpose: string;
}

const SKILL_FOCUSES: SkillFocus[] = [
  { strand: "sound", title: "Tone control", purpose: "Attack, release, muting, touch and relaxed movement." },
  { strand: "rhythm", title: "Timing and groove", purpose: "Pulse, subdivisions, rests, accents and changes." },
  { strand: "fretboard", title: "Neck navigation", purpose: "Landmarks, intervals and movable physical structures." },
  { strand: "ear", title: "Ear to hand", purpose: "Predict, sing, imitate and locate before naming." },
  { strand: "melody", title: "Melody and phrasing", purpose: "Contour, destination, articulation and variation." },
  { strand: "harmony", title: "Harmony", purpose: "Chord tones, movement, function and connected voices." },
  { strand: "composition", title: "Composition", purpose: "Develop, arrange and preserve musical choices." },
  { strand: "reflection", title: "Reflection and transfer", purpose: "Review evidence and move learning into a new context." }
];

const MASTERY_RANK: Record<MasteryState, number> = { introduced: 0, practising: 1, secure: 2, "transfer-ready": 3 };

function skillEvidence(strand: CompetencyStrand, state: V8State) {
  const evidence = state.evidence.filter((item) => item.competencyId.startsWith(`${strand}:`));
  const competencyIds = [...new Set(evidence.map((item) => item.competencyId))];
  const weakest = competencyIds.map((id) => masteryFor(id, state.evidence)).sort((a, b) => MASTERY_RANK[a.state] - MASTERY_RANK[b.state])[0];
  return { observations: evidence.length, state: weakest?.state };
}

function recommendationReason(activity: ActivityDefinition, strand: CompetencyStrand, state: V8State): string {
  const competencyIds = activity.competencyIds.filter((id) => id.startsWith(`${strand}:`));
  const evidence = state.evidence.filter((item) => competencyIds.includes(item.competencyId));
  const retries = evidence.filter((item) => item.outcome !== "successful").length;
  const assisted = evidence.filter((item) => item.assistance !== "none").length;
  const weakest = competencyIds.map((id) => masteryFor(id, state.evidence)).sort((a, b) => MASTERY_RANK[a.state] - MASTERY_RANK[b.state])[0];
  if (retries) return `${retries} attempt${retries === 1 ? " was" : "s were"} logged as partial or needing another pass for this unit. This is the least-secure unfinished activity for that skill.`;
  if (assisted) return `${assisted} assisted attempt${assisted === 1 ? " was" : "s were"} kept separate from independent mastery. This gives you a fresh independent pass at the same relationship.`;
  if (weakest?.state === "secure") return "This skill is secure in one context but has not yet transferred. Revisit it here before moving it to a new key, region or tempo.";
  if (weakest?.state === "transfer-ready") return "This relationship is already transfer-ready. The suggestion keeps it active without introducing material from later in the course.";
  return "Your evidence for this skill is still at Practising. This is the least-secure available activity you have already encountered.";
}

export function Practice() {
  const { state, dispatch, navigate } = useV8Store();
  const recommendedStrand = recommendedPracticeStrand(state);
  const [mode, setMode] = useState<CompetencyStrand>(() => recommendedStrand ?? "sound");
  const selected = SKILL_FOCUSES.find((item) => item.strand === mode) ?? SKILL_FOCUSES[0];
  const current = nextUnit(state);
  const observedCompetencyIds = useMemo(() => new Set(state.evidence.map((item) => item.competencyId)), [state.evidence]);
  const available = useMemo(() => ACTIVITIES.filter((activity) => {
    const unit = unitById(activity.unitId);
    return unit.order <= current.order + 1 && activity.competencyIds.some((id) => id.startsWith(`${selected.strand}:`) && observedCompetencyIds.has(id));
  }), [current.order, observedCompetencyIds, selected.strand]);
  const next = recommendPractice(available, state, [selected.strand]);
  const recommendationUnit = next ? unitById(next.unitId) : null;
  const competencyIds = [...new Set(state.evidence.map((item) => item.competencyId))];
  const mastery = competencyIds.map((id) => masteryFor(id, state.evidence));

  return (
    <div className="page-stack">
      <header className="page-header compact"><div><span className="eyebrow">Learn · Strengthen</span><h1>Strengthen what your playing reveals.</h1><p>This area only uses skills and relationships you have already encountered. Suggestions come from retries, partial results, assistance and independent mastery—not from unrelated activities later in the course.</p></div></header>

      {!state.evidence.length
        ? <section className="strengthen-empty card"><div><span className="eyebrow">No learning evidence yet</span><h2>Nothing to strengthen yet.</h2><p>Complete your first attempt in Continue. Once the app has something real to respond to, this area will suggest a focused review and explain why.</p></div><button className="primary-action" onClick={() => navigate("today")}>Go to Continue</button></section>
        : <>
            <div className="practice-section-heading"><div><span className="eyebrow">Choose a skill</span><h2>Review by musical ability, not lesson category.</h2></div><p>The suggested focus is selected automatically; you can choose another skill whenever you have evidence for it.</p></div>
            <section className="practice-modes" aria-label="Skill focuses">
              {SKILL_FOCUSES.map((item) => {
                const summary = skillEvidence(item.strand, state);
                const suggested = item.strand === recommendedStrand;
                return <button className={mode === item.strand ? "is-active" : ""} onClick={() => setMode(item.strand)} key={item.strand}><span>{item.title}</span><small>{item.purpose}</small><b>{suggested ? "Suggested · " : ""}{summary.observations ? `${summary.observations} observations · ${summary.state?.replace("-", " ")}` : "No evidence yet"}</b></button>;
              })}
            </section>

            {next && recommendationUnit
              ? <section className="practice-focus card">
                  <div><span className="eyebrow">Evidence-led suggestion · {selected.title}</span><h2>{next.title}</h2><small className="recommendation-context">Stage {recommendationUnit.stage} · {STAGES[recommendationUnit.stage - 1].title} → {recommendationUnit.title}</small><p className="recommendation-reason"><strong>Why this now:</strong> {recommendationReason(next, selected.strand, state)}</p><p>{next.why}</p><div className="competency-tags">{next.competencyIds.map((id) => <span key={id}>{id.split(":")[0]}</span>)}</div></div>
                  <button className="primary-action" onClick={() => dispatch({ type: "openActivity", activityId: next.id })}>Start strengthening</button>
                </section>
              : <section className="practice-focus card"><div><span className="eyebrow">No available evidence · {selected.title}</span><h2>Meet this skill in Continue first.</h2><p>Strengthen does not pull in unseen or later-course activities. Once you attempt this skill in your guided learning, its evidence-led review will appear here.</p></div><button className="primary-action" onClick={() => navigate("today")}>Go to Continue</button></section>}

            <section className="evidence-panel card">
              <header><div><span className="eyebrow">Evidence behind the suggestions</span><h2>Your developing relationships</h2></div><span>{state.evidence.length} observations</span></header>
              <div className="mastery-grid">{mastery.slice(-12).map((item) => <article key={item.competencyId}><strong>{item.competencyId.split(":")[0]}</strong><span className={`mastery-state state-${item.state}`}>{item.state.replace("-", " ")}</span><small>{item.successfulDays} independent days · {item.contextCount} contexts</small>{item.assistedAttempts > 0 && <small>{item.assistedAttempts} assisted attempt{item.assistedAttempts === 1 ? "" : "s"} kept separate</small>}<small className="mastery-next">{masteryNextStep(item)}</small></article>)}</div>
            </section>
          </>}
    </div>
  );
}
