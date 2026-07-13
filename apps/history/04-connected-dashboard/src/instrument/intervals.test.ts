import { describe, expect, it } from "vitest";
import { pitch } from "../domain/music";
import { buildFretboard } from "./guitar";
import {
  intervalBetween,
  positionsAtInterval,
  stringPairRules,
  transposedRoots
} from "./intervals";

describe("interval geometry", () => {
  it("finds the same interval from a physical root across multiple strings", () => {
    const root = buildFretboard().find((position) => position.string === 5 && position.fret === 8)!;
    const fifths = positionsAtInterval(root, 7);
    expect(fifths.length).toBeGreaterThan(3);
    expect(fifths.every((position) => intervalBetween(root, position) === 7)).toBe(true);
  });

  it("identifies the G-B tuning boundary", () => {
    const rules = stringPairRules(4);
    const boundary = rules.find((rule) => rule.crossesTuningBoundary);
    expect(boundary?.pair).toBe("G→B");
    expect(boundary?.movement).not.toBe(
      rules.find((rule) => !rule.crossesTuningBoundary)?.movement
    );
  });

  it("preserves interval identity through every key", () => {
    const transpositions = transposedRoots(pitch("C").pitchClass, 3);
    expect(transpositions).toHaveLength(12);
    expect(transpositions.every((item) => item.intervalLabel === "b3")).toBe(true);
  });
});

