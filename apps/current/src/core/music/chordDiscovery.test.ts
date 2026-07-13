import { describe, expect, it } from "vitest";
import { buildFretboard } from "../instrument/guitar";
import { createContext } from "./theory";
import { identifyChord } from "./chordDiscovery";

function shape(frets: readonly (number | null)[]) {
  const board = buildFretboard();
  return frets.flatMap((fret, string) =>
    fret === null ? [] : board.filter((position) => position.string === string && position.fret === fret)
  );
}

describe("V7 chord discovery", () => {
  it("identifies an open C major voicing and its doubled root", () => {
    const result = identifyChord(shape([0, 1, 0, 2, 3, null]), createContext("C", "major"));
    expect(result.candidates[0]).toMatchObject({
      symbol: "C",
      quality: "major",
      inversionLabel: "Root position",
      completeness: "complete"
    });
    expect(result.doubledPitchClasses).toContain(0);
    expect(result.candidates[0].context.relationship).toBe("diatonic");
  });

  it("recognises bVII as modal or borrowed against a major tonic", () => {
    const result = identifyChord(shape([1, 3, 3, 3, 1, null]), createContext("C", "major"));
    const bb = result.candidates.find((candidate) => candidate.symbol === "Bb");
    expect(bb?.context).toMatchObject({ roman: "bVII", relationship: "borrowed-or-modal" });
  });

  it("keeps partial thirdless shapes explicitly ambiguous", () => {
    const result = identifyChord(shape([null, null, null, 5, 3, null]), createContext("C", "major"));
    expect(result.candidates[0].quality).toBe("power");
    expect(result.candidates.some((candidate) => candidate.completeness === "partial")).toBe(true);
  });
});
