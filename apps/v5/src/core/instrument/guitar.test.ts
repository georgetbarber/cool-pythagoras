import { describe, expect, it } from "vitest";
import { buildChords, createContext } from "../music/theory";
import { buildFretboard, generateShapes, intervalPositions } from "./guitar";

describe("V5 guitar relationship model", () => {
  it("builds six strings through fret fifteen", () => {
    expect(buildFretboard()).toHaveLength(6 * 16);
  });

  it("finds the same interval identity across the neck", () => {
    const root = buildFretboard().find((position) => position.string === 5 && position.fret === 8)!;
    const fifths = intervalPositions(root, 7);
    expect(fifths.length).toBeGreaterThan(4);
    expect(fifths.every((position) => (position.midi - root.midi + 120) % 12 === 7)).toBe(true);
  });

  it("generates compact complete chord shapes", () => {
    const chord = buildChords(createContext("C", "major"))[0];
    const shapes = generateShapes(chord);
    expect(shapes.length).toBeGreaterThan(0);
    expect(shapes.every((shape) => shape.span <= 4)).toBe(true);
    expect(shapes.every((shape) =>
      chord.tones.every((tone) => shape.positions.some((position) => position.pitchClass === tone.pitchClass))
    )).toBe(true);
  });
});
