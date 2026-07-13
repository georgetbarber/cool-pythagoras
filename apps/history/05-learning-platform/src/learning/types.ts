import type { LearningFocus } from "../content/catalog";

export type ExperienceLevel = "new" | "some" | "confident";
export type GenreGoal = "pop" | "rock" | "blues" | "jazz" | "songwriting" | "freestyle";
export type PracticeMode = "knowledge" | "ear" | "fretboard" | "harmony" | "play-along";

export interface LearnerProfile {
  experience: ExperienceLevel;
  dailyMinutes: number;
  genres: GenreGoal[];
  focuses: LearningFocus[];
  practiceMode: PracticeMode;
}

export interface SkillEvidence {
  skill: string;
  attempts: number;
  correct: number;
  streak: number;
  lastSeen: string;
}

export interface LearningRecord {
  skills: Record<string, SkillEvidence>;
  completedLessons: string[];
  currentLessonId: string | null;
  currentLessonStep: number;
  totalPracticeMinutes: number;
}

export type ExerciseKind =
  | "scale-degree"
  | "interval-name"
  | "chord-function"
  | "fretboard-note"
  | "roman-numeral";

export interface ExercisePrompt {
  id: string;
  kind: ExerciseKind;
  skill: string;
  question: string;
  supportingText: string;
  answer: string;
  choices: readonly string[];
  audioTarget?: number;
  fretTarget?: { string: number; fret: number };
}
