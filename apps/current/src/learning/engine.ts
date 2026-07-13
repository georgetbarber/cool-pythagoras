import { buildChords, buildScale, intervalLabel, intervalName, noteName, normalize } from "../core/music/theory";
import type { PitchClass, TonalContext } from "../core/music/types";
import { buildFretboard } from "../core/instrument/guitar";
import type {
  ExerciseKind,
  ExercisePrompt,
  LearnerProfile,
  LearningRecord,
  SkillEvidence
} from "./types";
import { LESSONS } from "../content/catalog";

export const DEFAULT_PROFILE: LearnerProfile = {
  experience: "some",
  dailyMinutes: 15,
  genres: ["pop", "rock"],
  focuses: ["fretboard", "intervals", "progressions"],
  practiceMode: "knowledge"
};

export const EMPTY_RECORD: LearningRecord = {
  skills: {},
  completedLessons: [],
  currentLessonId: null,
  currentLessonStep: 0,
  totalPracticeMinutes: 0
};

export function skillAccuracy(evidence?: SkillEvidence): number {
  return evidence?.attempts ? Math.round((evidence.correct / evidence.attempts) * 100) : 0;
}

export function recordEvidence(
  record: LearningRecord,
  skill: string,
  contextKey: string,
  correct: boolean,
  now = new Date()
): LearningRecord {
  const existing = record.skills[skill] ?? {
    skill,
    attempts: 0,
    correct: 0,
    streak: 0,
    lastSeen: now.toISOString(),
    dueAt: now.toISOString(),
    intervalDays: 0,
    ease: 2.2,
    contexts: {}
  };
  const context = existing.contexts?.[contextKey] ?? { attempts: 0, correct: 0 };
  const nextStreak = correct ? existing.streak + 1 : 0;
  const intervalDays = correct
    ? nextStreak === 1
      ? 1
      : nextStreak === 2
        ? 3
        : Math.max(4, Math.round(Math.max(1, existing.intervalDays) * existing.ease))
    : 0;
  const dueAt = new Date(now.getTime() + intervalDays * 86_400_000).toISOString();
  return {
    ...record,
    skills: {
      ...record.skills,
      [skill]: {
        ...existing,
        attempts: existing.attempts + 1,
        correct: existing.correct + Number(correct),
        streak: nextStreak,
        lastSeen: now.toISOString(),
        dueAt,
        intervalDays,
        ease: Math.min(2.6, Math.max(1.4, existing.ease + (correct ? 0.05 : -0.2))),
        contexts: {
          ...existing.contexts,
          [contextKey]: {
            attempts: context.attempts + 1,
            correct: context.correct + Number(correct)
          }
        }
      }
    }
  };
}

export function dueSkills(record: LearningRecord, now = new Date()): SkillEvidence[] {
  return Object.values(record.skills)
    .filter((evidence) => new Date(evidence.dueAt ?? evidence.lastSeen).getTime() <= now.getTime())
    .sort((a, b) =>
      new Date(a.dueAt ?? a.lastSeen).getTime() - new Date(b.dueAt ?? b.lastSeen).getTime() ||
      skillAccuracy(a) - skillAccuracy(b)
    );
}

export function createReviewExercise(
  context: TonalContext,
  evidence: SkillEvidence,
  seed = Date.now()
): ExercisePrompt {
  const family = evidence.skill.split("-")[0];
  const kind: ExerciseKind =
    family === "degree" ? "scale-degree" :
    family === "interval" ? "interval-name" :
    family === "function" ? "chord-function" :
    family === "roman" ? "roman-numeral" :
    "fretboard-note";
  for (let offset = 0; offset < 120; offset += 1) {
    const prompt = createExercise(context, kind, seed + offset);
    if (prompt.skill === evidence.skill) return prompt;
  }
  return createExercise(context, kind, seed);
}

export function recommendedLesson(profile: LearnerProfile, record: LearningRecord) {
  const available = LESSONS.filter((lesson) =>
    lesson.prerequisites.every((id) => record.completedLessons.includes(id)) &&
    !record.completedLessons.includes(lesson.id)
  );
  return [...available].sort((a, b) => {
    const score = (lesson: (typeof LESSONS)[number]) =>
      Number(profile.focuses.includes(lesson.focus)) * 4 +
      Number(
        (profile.practiceMode === "play-along" && lesson.kind === "play-along") ||
        (profile.practiceMode !== "play-along" && lesson.kind === "knowledge")
      ) * 2 +
      Number(lesson.genres?.some((genre) => profile.genres.includes(genre)) ?? false) * 3;
    return score(b) - score(a);
  })[0] ?? LESSONS[0];
}

export function weakestSkills(record: LearningRecord, limit = 3): SkillEvidence[] {
  return Object.values(record.skills)
    .sort((a, b) => skillAccuracy(a) - skillAccuracy(b) || a.attempts - b.attempts)
    .slice(0, limit);
}

export function skillLabel(skill: string): string {
  const [family, ...parts] = skill.split("-");
  const value = parts.join("-");
  const labels: Record<string, string> = {
    degree: `Scale degree ${value}`,
    interval: `Interval ${value} semitones`,
    function: `${value.replaceAll("-", " ")} function`,
    roman: `Roman numeral degree ${value}`,
    fretboard: `String ${Number(value) + 1} geography`
  };
  return labels[family] ?? skill.replaceAll("-", " ");
}

function rotate<T>(values: readonly T[], seed: number): T[] {
  if (!values.length) return [];
  const start = Math.abs(seed) % values.length;
  return [...values.slice(start), ...values.slice(0, start)];
}

function uniqueChoices(answer: string, alternatives: readonly string[], seed: number): string[] {
  const values = [answer, ...alternatives.filter((choice) => choice !== answer)];
  return rotate([...new Set(values)].slice(0, 7), seed);
}

export function createExercise(context: TonalContext, kind: ExerciseKind, seed = Date.now()): ExercisePrompt {
  const scale = buildScale(context);
  const chords = buildChords(context);
  const targetIndex = Math.abs(seed) % scale.length;
  const target = scale[targetIndex];
  const chord = chords[Math.abs(seed * 3 + 1) % chords.length];

  if (kind === "scale-degree") {
    return {
      id: `${kind}-${seed}`,
      kind,
      skill: `degree-${target.degreeLabel}`,
      question: `What scale degree is ${target.name} in ${context.tonicName} ${context.mode}?`,
      supportingText: "Answer relative to the tonal centre, not from the note name alone.",
      answer: target.degreeLabel,
      choices: uniqueChoices(target.degreeLabel, scale.map((tone) => tone.degreeLabel), seed),
      explanation: `${target.name} is ${target.interval} semitones above ${context.tonicName}, so its tonal role is ${target.degreeLabel}.`,
      audioTarget: target.pitchClass
    };
  }

  if (kind === "interval-name") {
    return {
      id: `${kind}-${seed}`,
      kind,
      skill: `interval-${target.interval}`,
      question: `What is ${target.name} relative to ${context.tonicName}?`,
      supportingText: `${target.interval} semitones from the tonal centre.`,
      answer: `${intervalLabel(target.interval)} · ${intervalName(target.interval)}`,
      choices: uniqueChoices(
        `${intervalLabel(target.interval)} · ${intervalName(target.interval)}`,
        scale.map((tone) => `${intervalLabel(tone.interval)} · ${intervalName(tone.interval)}`),
        seed
      ),
      explanation: `${target.name} is ${target.interval} semitones from ${context.tonicName}: ${intervalLabel(target.interval)}, the ${intervalName(target.interval)}.`,
      audioTarget: target.pitchClass
    };
  }

  if (kind === "chord-function") {
    return {
      id: `${kind}-${seed}`,
      kind,
      skill: `function-${chord.functionFamily}`,
      question: `What is the main function of ${chord.roman} · ${chord.symbol}?`,
      supportingText: `The tonal centre remains ${context.tonicName}.`,
      answer: chord.functionLabel,
      choices: uniqueChoices(chord.functionLabel, chords.map((item) => item.functionLabel), seed),
      explanation: `${chord.roman} is ${chord.functionLabel.toLowerCase()} here because ${chord.explanation.toLowerCase()}`
    };
  }

  if (kind === "roman-numeral") {
    return {
      id: `${kind}-${seed}`,
      kind,
      skill: `roman-${chord.degree}`,
      question: `Which Roman numeral describes ${chord.symbol} in ${context.tonicName} ${context.mode}?`,
      supportingText: "Roman numerals describe a chord root and quality relative to the key.",
      answer: chord.roman,
      choices: uniqueChoices(chord.roman, chords.map((item) => item.roman), seed),
      explanation: `${chord.symbol} is built on degree ${chord.degreeLabel}; its ${chord.quality} quality determines the case and suffix ${chord.roman}.`
    };
  }

  const positions = buildFretboard();
  const position = positions[Math.abs(seed * 7 + 11) % positions.length];
  const answer = noteName(position.pitchClass, context.tonicName.includes("b"));
  const chromatic = Array.from({ length: 12 }, (_, index) =>
    noteName(normalize(context.tonic + index), context.tonicName.includes("b"))
  );
  return {
    id: `${kind}-${seed}`,
    kind,
    skill: `fretboard-${position.string}`,
    question: `Name the note on string ${position.string + 1}, fret ${position.fret}.`,
    supportingText: "Use the open-string note and count semitones, or use a nearby landmark.",
    answer,
    choices: uniqueChoices(answer, chromatic, seed).slice(0, 6),
    explanation: `String ${position.string + 1} starts on ${["E", "B", "G", "D", "A", "E"][position.string]}; moving ${position.fret} frets raises it by ${position.fret} semitones to ${answer}.`,
    fretTarget: { string: position.string, fret: position.fret },
    audioTarget: position.pitchClass as PitchClass
  };
}
