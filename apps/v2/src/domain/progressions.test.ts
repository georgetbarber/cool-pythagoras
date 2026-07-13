import { describe, expect, it } from "vitest";
import { PROGRESSIONS } from "./constants";

const MAJOR_LIBRARY = [
  "Pop Canon",
  "50s Doo-Wop",
  "Blues Changes",
  "Jazz ii-V-I",
  "Extended Axis"
];

const MINOR_LIBRARY = [
  "Minor Pop",
  "Minor Descent",
  "Minor Blues Changes",
  "Emotional",
  "Classic Minor",
  "Andalusian Cadence"
];

describe("progression library", () => {
  it("provides the corrected major progression library", () => {
    const names = PROGRESSIONS.filter((progression) =>
      progression.modes.includes("major")
    ).map((progression) => progression.name);
    expect(names).toEqual(MAJOR_LIBRARY);
  });

  it("provides the corrected minor progression library", () => {
    const names = PROGRESSIONS.filter((progression) =>
      progression.modes.includes("minor")
    ).map((progression) => progression.name);
    expect(names).toEqual(MINOR_LIBRARY);
  });

  it("keeps every degree within the seven-note scale", () => {
    for (const progression of PROGRESSIONS) {
      expect(progression.degrees.every((degree) => degree >= 0 && degree < 7)).toBe(
        true
      );
      expect(progression.formula.split(" - ")).toHaveLength(
        progression.degrees.length
      );
      if (progression.qualityOverrides) {
        expect(progression.qualityOverrides).toHaveLength(
          progression.degrees.length
        );
      }
    }
  });

  it("uses a unique stable identifier for every progression", () => {
    expect(new Set(PROGRESSIONS.map((progression) => progression.id)).size).toBe(
      PROGRESSIONS.length
    );
  });

  it("marks the original major-V minor progressions as harmonic dominant", () => {
    const harmonicDominantNames = PROGRESSIONS.filter(
      (progression) => progression.harmonicDominant
    ).map((progression) => progression.name);
    expect(harmonicDominantNames).toEqual([
      "Minor Descent",
      "Emotional",
      "Classic Minor",
      "Andalusian Cadence"
    ]);
  });

  it("uses stylistically correct seventh qualities for blues and jazz", () => {
    expect(
      PROGRESSIONS.find((progression) => progression.id === "blues-turnaround")
        ?.qualityOverrides
    ).toEqual(["Dominant 7", "Dominant 7", "Dominant 7"]);
    expect(
      PROGRESSIONS.find((progression) => progression.id === "jazz-ii-v-i")
        ?.qualityOverrides
    ).toEqual(["Minor 7", "Dominant 7", "Major 7"]);
    expect(
      PROGRESSIONS.find((progression) => progression.id === "minor-blues")
        ?.qualityOverrides
    ).toEqual(["Minor 7", "Minor 7", "Dominant 7"]);
  });

  it("places the Andalusian cadence in minor with a major dominant", () => {
    const andalusian = PROGRESSIONS.find(
      (progression) => progression.id === "andalusian"
    );
    expect(andalusian).toMatchObject({
      formula: "i - VII - VI - V",
      degrees: [0, 6, 5, 4],
      modes: ["minor"],
      harmonicDominant: true
    });
  });
});
