import { ACTIVITIES, CURRICULUM, activityById, unitById } from "./curriculum";
import type {
  Assistance,
  CompetencyEvidence,
  EvidenceContext,
  EvidenceOutcome,
  MasterySummary,
  SessionItem,
  SessionPlan,
  V8State
} from "./types";

function day(value: string): string {
  return value.slice(0, 10);
}

function contextKey(context: EvidenceContext): string {
  return [context.key, context.mode, context.fretRegion?.join("-"), context.tempo, context.instrument]
    .filter((value) => value !== undefined)
    .join("|");
}

export function masteryFor(competencyId: string, evidence: CompetencyEvidence[]): MasterySummary {
  const relevant = evidence.filter((item) => item.competencyId === competencyId);
  const independent = relevant.filter((item) => item.assistance === "none" && item.outcome === "successful");
  const successfulDays = new Set(independent.map((item) => day(item.occurredAt))).size;
  const contextCount = new Set(independent.map((item) => contextKey(item.context))).size;
  const hasTransfer = independent.some((item) => item.source === "transfer");
  const state = successfulDays >= 2 && contextCount >= 2 && hasTransfer
    ? "transfer-ready"
    : successfulDays >= 2
      ? "secure"
      : relevant.length
        ? "practising"
        : "introduced";
  return {
    competencyId,
    state,
    successfulDays,
    contextCount,
    assistedAttempts: relevant.filter((item) => item.assistance !== "none").length
  };
}

export function unitProgress(state: V8State, unitId: string): number {
  const unit = unitById(unitId);
  const completed = unit.activities.filter((activity) => state.completedActivityIds.includes(activity.id)).length;
  return Math.round((completed / unit.activities.length) * 100);
}

export function nextUnit(state: V8State) {
  const startingOrder = state.settings.startingBaseline === "secure" ? 7 : state.settings.startingBaseline === "some" ? 3 : 1;
  return CURRICULUM.find((unit) => unit.order >= startingOrder && unitProgress(state, unit.id) < 100) ?? CURRICULUM.at(-1)!;
}

function sessionItem(activityId: string, minutes: number): SessionItem {
  const activity = activityById(activityId) ?? ACTIVITIES[0];
  return { activityId, title: activity.title, purpose: activity.why, minutes, kind: activity.kind };
}

export function buildSession(state: V8State, now = new Date()): SessionPlan {
  const unit = nextUnit(state);
  const unfinished = unit.activities.filter((activity) => !state.completedActivityIds.includes(activity.id));
  const choose = (kinds: typeof unit.activities[number]["kind"][], fallback: number) =>
    unfinished.find((activity) => kinds.includes(activity.kind)) ?? unit.activities[fallback];
  const selections: Array<[ReturnType<typeof choose>, number]> = [
    [choose(["listen-compare", "sing-predict"], 0), 3],
    [choose(["technique", "rhythm"], 2), 5],
    [choose(["relationship", "play-reveal"], 4), 6],
    [choose(["variation", "transfer"], 5), 6],
    [choose(["creative", "reflection"], 6), 5]
  ];
  const items = selections.map(([activity, minutes]) => sessionItem(activity.id, minutes));
  return {
    id: `session-${now.toISOString().slice(0, 10)}-${unit.id}`,
    unitId: unit.id,
    title: unit.title,
    purpose: unit.outcome,
    totalMinutes: items.reduce((sum, item) => sum + item.minutes, 0),
    items,
    generatedAt: now.toISOString()
  };
}

export function createEvidence(
  activityId: string,
  competencyIds: string[],
  source: CompetencyEvidence["source"],
  assistance: Assistance,
  outcome: EvidenceOutcome,
  context: EvidenceContext,
  occurredAt = new Date().toISOString()
): CompetencyEvidence[] {
  return competencyIds.map((competencyId, index) => ({
    id: `${occurredAt}-${activityId}-${index}`,
    competencyId,
    source,
    assistance,
    context,
    outcome,
    occurredAt,
    activityId
  }));
}

export function pathSummary(state: V8State) {
  const completedUnits = CURRICULUM.filter((unit) => unitProgress(state, unit.id) === 100).length;
  const created = state.sketches.length;
  const revised = state.sketches.filter((sketch) => sketch.revisions.length > 0).length;
  const finished = state.sketches.filter((sketch) => sketch.status === "finished").length;
  return { completedUnits, totalUnits: CURRICULUM.length, created, revised, finished };
}
