import type { ModeId } from "../core/music/types";

export type RouteId = "today" | "path" | "practice" | "create" | "explore";
export type MasteryState = "introduced" | "practising" | "secure" | "transfer-ready";
export type Assistance = "none" | "hint" | "reveal" | "guided";
export type EvidenceSource = "recognition" | "production" | "performance" | "transfer" | "creation" | "reflection";
export type EvidenceOutcome = "successful" | "partial" | "retry";
export type Instrument = "electric" | "acoustic";

export const COMPETENCY_STRANDS = [
  "sound", "rhythm", "fretboard", "ear", "melody", "harmony", "composition", "reflection"
] as const;
export type CompetencyStrand = typeof COMPETENCY_STRANDS[number];

export interface EvidenceContext {
  key?: string;
  mode?: ModeId;
  fretRegion?: [number, number];
  tempo?: number;
  instrument?: Instrument;
}

export interface CompetencyEvidence {
  id: string;
  competencyId: string;
  source: EvidenceSource;
  assistance: Assistance;
  context: EvidenceContext;
  outcome: EvidenceOutcome;
  occurredAt: string;
  activityId: string;
}

export type ActivityKind =
  | "listen-compare"
  | "sing-predict"
  | "technique"
  | "rhythm"
  | "relationship"
  | "play-reveal"
  | "variation"
  | "creative"
  | "transfer"
  | "reflection";

export interface ActivityDefinition {
  id: string;
  unitId: string;
  kind: ActivityKind;
  title: string;
  instruction: string;
  why: string;
  minutes: number;
  competencyIds: string[];
  source: EvidenceSource;
  observable: string;
  prompt: string;
  hint?: string;
  reveal?: string;
}

export interface MicroStudy {
  title: string;
  purpose: string;
  tempo: number;
  metre: "4/4" | "3/4" | "6/8";
  tab: string[];
  rhythm: string;
  earTargets?: readonly number[];
}

export interface CurriculumUnit {
  id: string;
  stage: number;
  order: number;
  title: string;
  outcome: string;
  focus: string;
  prerequisiteIds: string[];
  competencyIds: string[];
  microStudy: MicroStudy;
  activities: ActivityDefinition[];
  optional?: boolean;
}

export interface SessionItem {
  activityId: string;
  title: string;
  purpose: string;
  minutes: number;
  kind: ActivityKind;
}

export interface SessionPlan {
  id: string;
  unitId: string;
  title: string;
  purpose: string;
  totalMinutes: number;
  items: SessionItem[];
  generatedAt: string;
}

export interface LearnerSettings {
  instrument: Instrument;
  dailyMinutes: number;
  tonicName: string;
  mode: ModeId;
  theme: "light" | "dark";
  reducedMotion: boolean;
  diagnosticComplete: boolean;
  startingBaseline: "repair" | "some" | "secure";
}

export interface Reflection {
  id: string;
  prompt: string;
  response: string;
  createdAt: string;
}

export interface ChordEvent {
  id: string;
  symbol: string;
  beats: number;
  voicing: Array<number | null>;
}

export interface MelodyEvent {
  id: string;
  string: number;
  fret: number;
  beat: number;
  duration: number;
}

export interface RecordedTake {
  id: string;
  name: string;
  createdAt: string;
  blobId?: string;
  note: string;
}

export interface SketchRevision {
  id: string;
  createdAt: string;
  summary: string;
  snapshot: Pick<Sketch, "chords" | "melody" | "rhythmPattern" | "sections" | "notes">;
}

export interface Sketch {
  id: string;
  name: string;
  intention: string;
  tags: string[];
  tempo: number;
  metre: "4/4" | "3/4" | "6/8";
  key: string | null;
  mode: ModeId | null;
  chords: ChordEvent[];
  melody: MelodyEvent[];
  rhythmPattern: string;
  bassMovement: string;
  sections: string[];
  notes: string;
  ambiguityNotes: string;
  takes: RecordedTake[];
  revisions: SketchRevision[];
  reflections: Reflection[];
  status: "capture" | "understand" | "vary" | "arrange" | "record" | "compare" | "revise" | "finished";
  createdAt: string;
  updatedAt: string;
}

export interface V8State {
  version: 8;
  syncVersion: 1;
  updatedAt: string;
  settingsUpdatedAt: string;
  route: RouteId;
  activeUnitId: string;
  activeActivityId: string | null;
  resumeActivityId: string | null;
  completedActivityIds: string[];
  evidence: CompetencyEvidence[];
  settings: LearnerSettings;
  sketches: Sketch[];
  deletedSketchIds: Record<string, string>;
  activeSketchId: string | null;
  lastReflection: string;
}

export interface MasterySummary {
  competencyId: string;
  state: MasteryState;
  successfulDays: number;
  contextCount: number;
  assistedAttempts: number;
}
