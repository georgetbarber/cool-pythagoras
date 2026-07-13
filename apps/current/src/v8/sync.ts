import type { CompetencyEvidence, LearnerSettings, Sketch, V8State } from "./types";

export interface CloudProfile {
  schemaVersion: 1;
  activeUnitId: string;
  completedActivityIds: string[];
  settings: LearnerSettings;
  settingsUpdatedAt: string;
  lastReflection: string;
  deletedSketchIds: Record<string, string>;
  updatedAt: string;
}

export interface CloudSnapshot {
  profile?: CloudProfile | null;
  evidence?: CompetencyEvidence[];
  sketches?: Sketch[];
}

export function cloudProfile(state: V8State): CloudProfile {
  return {
    schemaVersion: 1,
    activeUnitId: state.activeUnitId,
    completedActivityIds: state.completedActivityIds,
    settings: state.settings,
    settingsUpdatedAt: state.settingsUpdatedAt,
    lastReflection: state.lastReflection,
    deletedSketchIds: state.deletedSketchIds,
    updatedAt: state.updatedAt
  };
}

export function cloudSketch(sketch: Sketch): Sketch {
  // Audio blobs and their device-only metadata never enter cloud sync.
  return { ...sketch, takes: [] };
}

function newestDate(a?: string, b?: string): string {
  return !a || (b && b > a) ? (b ?? a ?? "") : a;
}

function mergeDeletions(local: Record<string, string>, remote: Record<string, string> = {}) {
  const merged = { ...local };
  for (const [id, occurredAt] of Object.entries(remote)) merged[id] = newestDate(merged[id], occurredAt);
  return merged;
}

function mergeTakes(local: Sketch["takes"], remote: Sketch["takes"]) {
  const byId = new Map([...remote, ...local].map((take) => [take.id, take]));
  return [...byId.values()];
}

function mergeRevisions(local: Sketch["revisions"], remote: Sketch["revisions"]) {
  const byId = new Map([...remote, ...local].map((revision) => [revision.id, revision]));
  return [...byId.values()].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export function mergeCloudSnapshot(state: V8State, incoming: CloudSnapshot): V8State {
  const profile = incoming.profile;
  const remoteIsNewer = Boolean(profile && profile.updatedAt > state.updatedAt);
  const remoteSettingsAreNewer = Boolean(profile && profile.settingsUpdatedAt > state.settingsUpdatedAt);
  const deletedSketchIds = mergeDeletions(state.deletedSketchIds, profile?.deletedSketchIds);
  const evidence = [...state.evidence];
  const evidenceIds = new Set(evidence.map((item) => item.id));
  for (const item of incoming.evidence ?? []) if (!evidenceIds.has(item.id)) evidence.push(item);

  const sketches = new Map(state.sketches.map((sketch) => [sketch.id, sketch]));
  for (const remote of incoming.sketches ?? []) {
    const local = sketches.get(remote.id);
    if (!local) sketches.set(remote.id, remote);
    else if (remote.updatedAt > local.updatedAt) sketches.set(remote.id, {
      ...remote,
      takes: mergeTakes(local.takes, remote.takes),
      revisions: mergeRevisions(local.revisions, remote.revisions)
    });
    else sketches.set(local.id, { ...local, revisions: mergeRevisions(local.revisions, remote.revisions) });
  }
  const visibleSketches = [...sketches.values()].filter((sketch) => !deletedSketchIds[sketch.id] || deletedSketchIds[sketch.id] < sketch.updatedAt);
  const activeSketchId = visibleSketches.some((sketch) => sketch.id === state.activeSketchId) ? state.activeSketchId : null;

  return {
    ...state,
    activeUnitId: remoteIsNewer && profile ? profile.activeUnitId : state.activeUnitId,
    completedActivityIds: [...new Set([...state.completedActivityIds, ...(profile?.completedActivityIds ?? [])])],
    settings: remoteSettingsAreNewer && profile ? profile.settings : state.settings,
    settingsUpdatedAt: remoteSettingsAreNewer && profile ? profile.settingsUpdatedAt : state.settingsUpdatedAt,
    lastReflection: remoteIsNewer && profile ? profile.lastReflection : state.lastReflection,
    deletedSketchIds,
    evidence: evidence.sort((a, b) => a.occurredAt.localeCompare(b.occurredAt)),
    sketches: visibleSketches.sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
    activeSketchId,
    updatedAt: newestDate(state.updatedAt, profile?.updatedAt)
  };
}
