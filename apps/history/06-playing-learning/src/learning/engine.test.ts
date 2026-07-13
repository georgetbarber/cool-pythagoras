import { describe, expect, it } from "vitest";
import { createContext } from "../core/music/theory";
import {
  DEFAULT_PROFILE,
  EMPTY_RECORD,
  createExercise,
  createReviewExercise,
  dueSkills,
  recordEvidence,
  recommendedLesson
} from "./engine";

describe("V6 learning engine", () => {
  it("records evidence by skill and tonal context without losing prior attempts", () => {
    const first = recordEvidence(EMPTY_RECORD, "degree-3", "C-major", true, new Date("2026-01-01"));
    const second = recordEvidence(first, "degree-3", "D-dorian", false, new Date("2026-01-02"));
    expect(second.skills["degree-3"]).toMatchObject({ attempts: 2, correct: 1, streak: 0 });
    expect(second.skills["degree-3"].contexts).toEqual({
      "C-major": { attempts: 1, correct: 1 },
      "D-dorian": { attempts: 1, correct: 0 }
    });
  });

  it("schedules successful retrieval into the future and failures immediately", () => {
    const now = new Date("2026-01-01T12:00:00Z");
    const correct = recordEvidence(EMPTY_RECORD, "degree-3", "C-major", true, now);
    expect(correct.skills["degree-3"]).toMatchObject({ intervalDays: 1 });
    expect(dueSkills(correct, now)).toHaveLength(0);
    const failed = recordEvidence(correct, "degree-3", "C-major", false, now);
    expect(dueSkills(failed, now).map((item) => item.skill)).toEqual(["degree-3"]);
  });

  it("recreates a prompt for a due skill", () => {
    const context = createContext("C", "major");
    const record = recordEvidence(EMPTY_RECORD, "degree-3", "C-major", false, new Date("2026-01-01"));
    expect(createReviewExercise(context, record.skills["degree-3"], 1).skill).toBe("degree-3");
  });

  it("respects lesson prerequisites", () => {
    const recommendation = recommendedLesson(DEFAULT_PROFILE, EMPTY_RECORD);
    expect(recommendation.prerequisites).toHaveLength(0);
  });

  it("uses the learner's preferred session and genres after prerequisites are met", () => {
    const recommendation = recommendedLesson(
      { ...DEFAULT_PROFILE, practiceMode: "play-along", genres: ["pop"] },
      { ...EMPTY_RECORD, completedLessons: ["tonal-home"] }
    );
    expect(recommendation.id).toBe("first-playalong");
  });

  it("creates deterministic exercises from a seed", () => {
    const context = createContext("Eb", "major");
    expect(createExercise(context, "scale-degree", 42))
      .toEqual(createExercise(context, "scale-degree", 42));
  });

  it("creates all exercise families with answer choices", () => {
    const context = createContext("C", "major");
    const kinds = ["scale-degree", "interval-name", "chord-function", "fretboard-note", "roman-numeral"] as const;
    expect(kinds.every((kind, index) => createExercise(context, kind, index + 1).choices.length > 1)).toBe(true);
    expect(kinds.every((kind, index) => createExercise(context, kind, index + 1).explanation.length > 20)).toBe(true);
  });
});
