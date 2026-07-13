import { describe, expect, it } from "vitest";
import { buildChords, createContext } from "../music/theory";
import {
  buildFretboard,
  cagedMajorPositions,
  connectChordShapes,
  generateShapes,
  intervalPositions,
  shapeMovement,
  triadShapes
} from "./guitar";

describe("V6 guitar relationship model", () => {
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
    expect(shapes.every((shape) => shape.inversionLabel.length > 0 && shape.fretPattern.length > 0)).toBe(true);
    expect(shapes.every((shape) =>
      !shape.positions.some((position) => position.fret === 0) || shape.maxFret <= 4
    )).toBe(true);
  });

  it("connects a progression with playable shapes and measurable movement", () => {
    const chords = [1, 4, 5, 1].map((degree) => buildChords(createContext("C", "major"))[degree - 1]);
    const shapes = connectChordShapes(chords);
    expect(shapes).toHaveLength(chords.length);
    expect(shapes.every((shape) => shape.positions.length === 3)).toBe(true);
    expect(shapes.slice(1).every((shape, index) => shapeMovement(shapes[index], shape) >= 0)).toBe(true);
  });

  it("maps all five CAGED major forms to the requested root", () => {
    const positions = cagedMajorPositions(0);
    expect(new Set(positions.map((position) => position.form))).toEqual(new Set(["C", "A", "G", "E", "D"]));
    expect(positions.every((position) => position.rootPositions.length > 0)).toBe(true);
    expect(positions.every((position) =>
      position.positions.every((note) => [0, 4, 7].includes(note.pitchClass))
    )).toBe(true);
  });

  it("provides triad inversions across multiple string sets", () => {
    const chord = buildChords(createContext("C", "major"), true)[0];
    const shapes = triadShapes(chord);
    expect(shapes.length).toBeGreaterThan(6);
    expect(new Set(shapes.map((shape) => shape.inversionLabel)).size).toBeGreaterThan(1);
    expect(new Set(shapes.map((shape) =>
      shape.positions.map((position) => position.string).sort().join("-")
    )).size).toBeGreaterThan(2);
  });
});
