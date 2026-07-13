import { useMemo, useState } from "react";
import { playHarmonicRelationship, playMelodicRelationship } from "../../audio/engine";
import { createContext, normalize } from "../../core/music/theory";
import { activityById, unitById } from "../curriculum";
import { createEvidence } from "../learning";
import { useV8Store } from "../store";
import type { Assistance, EvidenceOutcome } from "../types";
import { MicroStudy } from "./MicroStudy";
import { RhythmNotation } from "./RhythmNotation";

const OUTCOMES: Array<{ value: EvidenceOutcome; label: string; description: string }> = [
  { value: "retry", label: "Needs another pass", description: "I could not yet control or explain it." },
  { value: "partial", label: "Partly there", description: "Some of it worked, but not reliably." },
  { value: "successful", label: "Successful today", description: "I completed the observable action deliberately." }
];

export function ActivityPlayer({ activityId, onClose }: { activityId: string; onClose?: () => void }) {
  const { state, dispatch } = useV8Store();
  const activity = activityById(activityId);
  const [assistance, setAssistance] = useState<Assistance>("none");
  const [hint, setHint] = useState(false);
  const [reveal, setReveal] = useState(false);
  const [reflection, setReflection] = useState("");
  const [attempted, setAttempted] = useState(false);
  const [earIndex, setEarIndex] = useState(0);
  const unit = useMemo(() => unitById(activity?.unitId ?? state.activeUnitId), [activity?.unitId, state.activeUnitId]);
  if (!activity) return null;

  const targets = unit.microStudy.earTargets ?? [0];
  const hear = (harmonic = false) => {
    setAttempted(true);
    const tonicPc = createContext(state.settings.tonicName, state.settings.mode).tonic;
    const semitones = targets[earIndex % targets.length];
    setEarIndex((index) => index + 1);
    if (harmonic) playHarmonicRelationship(tonicPc, normalize(tonicPc + semitones));
    else playMelodicRelationship(tonicPc, normalize(tonicPc + semitones));
  };
  const useHint = () => {
    setHint(true);
    if (assistance === "none") setAssistance("hint");
  };
  const useReveal = () => {
    setReveal(true);
    setAssistance("reveal");
  };
  const complete = (outcome: EvidenceOutcome) => {
    if (!attempted && activity.kind !== "reflection") return;
    if (activity.kind === "reflection" && reflection.trim().length < 8) return;
    const evidence = createEvidence(
      activity.id,
      activity.competencyIds,
      activity.source,
      assistance,
      outcome,
      {
        key: state.settings.tonicName,
        mode: state.settings.mode,
        tempo: unit.microStudy.tempo,
        instrument: state.settings.instrument,
        fretRegion: unit.stage < 3 ? [0, 5] : [0, 12]
      }
    );
    dispatch({ type: "recordActivity", activityId: activity.id, evidence, reflection: reflection.trim() });
    onClose?.();
  };

  return (
    <section className="activity-player" aria-labelledby="activity-title">
      <header className="activity-header">
        <button className="icon-button" onClick={onClose} aria-label="Close activity">←</button>
        <div><span>{unit.title} · {activity.minutes} minutes</span><h1 id="activity-title">{activity.title}</h1><p>{activity.why}</p></div>
      </header>

      <div className="activity-grid">
        <article className="activity-main card">
          <span className="activity-kind">{activity.kind.replaceAll("-", " ")}</span>
          <h2>{activity.instruction}</h2>
          <p className="activity-prompt">{activity.prompt}</p>
          <MicroStudy study={unit.microStudy} />
          {activity.kind === "rhythm" && <RhythmNotation pattern={unit.microStudy.rhythm} metre={unit.microStudy.metre} />}
          {["listen-compare", "sing-predict", "relationship"].includes(activity.kind) && (
            <div className="action-row">
              <button className="primary-action" onClick={() => hear(false)}>{targets.length === 1 && targets[0] === 0 ? "Hear the tonic reference" : "Hear reference and target"}</button>
              {!(targets.length === 1 && targets[0] === 0) && <button className="secondary-action" onClick={() => hear(true)}>Hear together</button>}
            </div>
          )}
          {["technique", "rhythm", "play-reveal", "variation", "transfer"].includes(activity.kind) && (
            <button className={`attempt-pad ${attempted ? "is-done" : ""}`} onClick={() => setAttempted(true)}>
              <strong>{attempted ? "Attempt recorded" : "Play the task now"}</strong>
              <span>{attempted ? "Listen to the result before assessing it." : "Tap after you have made a deliberate attempt on the guitar."}</span>
            </button>
          )}
          {activity.kind === "creative" && (
            <div className="creative-bridge">
              <div><strong>Make two to four bars</strong><span>Capture the idea in the Sketchbook, then return here to describe the result.</span></div>
              <button className="secondary-action" onClick={() => { dispatch({ type: "createSketch" }); dispatch({ type: "suspendActivity", route: "create" }); history.pushState({}, "", "/create"); }}>Open a new sketch</button>
              <button className="text-action" onClick={() => setAttempted(true)}>I captured the idea</button>
            </div>
          )}
          {activity.kind === "reflection" && (
            <label className="reflection-field">What changed, what remains uncertain, and what will you keep?
              <textarea value={reflection} onChange={(event) => { setReflection(event.target.value); setAttempted(event.target.value.trim().length >= 8); }} placeholder="Be specific about sound, timing, movement or intention…" />
            </label>
          )}
          <div className="help-actions">
            <button onClick={useHint}>Use a hint</button>
            <button onClick={useReveal}>Reveal the reference</button>
          </div>
          {hint && <aside className="guidance"><strong>Hint</strong><p>{activity.hint}</p></aside>}
          {reveal && <aside className="guidance reveal"><strong>Reference, not a shortcut</strong><p>{activity.reveal}</p></aside>}
        </article>

        <aside className="activity-check card">
          <span>Observable outcome</span>
          <p>{activity.observable}</p>
          <div className="assistance-state"><small>Evidence status</small><strong>{assistance === "none" ? "Independent attempt" : `${assistance} used`}</strong></div>
          <div className="outcome-buttons">
            {OUTCOMES.map((outcome) => (
              <button disabled={!attempted} onClick={() => complete(outcome.value)} key={outcome.value}>
                <strong>{outcome.label}</strong><span>{outcome.description}</span>
              </button>
            ))}
          </div>
          {!attempted && <small>Complete the musical action before assessing it.</small>}
        </aside>
      </div>
    </section>
  );
}
