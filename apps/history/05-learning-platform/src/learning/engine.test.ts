import { describe, expect, it } from "vitest";
import { createContext } from "../core/music/theory";
import { DEFAULT_PROFILE, EMPTY_RECORD, createExercise, recordEvidence, recommendedLesson } from "./engine";

describe("V5 learning engine", () => {
  it("records evidence by skill without losing prior attempts", () => {
    const first = recordEvidence(EMPTY_RECORD, "degree-3", true, new Date("2026-01-01"));
    const second = recordEvidence(first, "degree-3", false, new Date("2026-01-02"));
    expect(second.skills["degree-3"]).toMatchObject({ attempts: 2, correct: 1, streak: 0 });
  });

  it("respects lesson prerequisites", () => {
    const recommendation = recommendedLesson(DEFAULT_PROFILE, EMPTY_RECORD);
    expect(recommendation.prerequisites).toHaveLength(0);
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
  });
});
