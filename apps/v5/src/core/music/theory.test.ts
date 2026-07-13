import { describe, expect, it } from "vitest";
import {
  analyzeRelationship,
  buildChords,
  buildScale,
  createContext
} from "./theory";

describe("V5 contextual music model", () => {
  it("keeps scale degree and chord role separate", () => {
    const context = createContext("C", "major");
    const dominant = buildChords(context, true).find((chord) => chord.degree === 5)!;
    const relationship = analyzeRelationship(context, 11, dominant);
    expect(relationship.scaleDegree?.degreeLabel).toBe("7");
    expect(relationship.chordTone?.intervalLabel).toBe("3");
  });

  it("gives chordal-seventh tendency priority in context", () => {
    const context = createContext("C", "major");
    const dominant = buildChords(context, true).find((chord) => chord.degree === 5)!;
    const relationship = analyzeRelationship(context, 5, dominant);
    expect(relationship.chordTone?.intervalLabel).toBe("b7");
    expect(relationship.tendency).toContain("chordal seventh");
  });

  it("represents blues harmony with functional I7, IV7, and V7", () => {
    const chords = buildChords(createContext("A", "blues"));
    expect(chords.map((chord) => chord.roman)).toEqual(["I7", "IV7", "V7"]);
    expect(chords.map((chord) => chord.symbol)).toEqual(["A7", "D7", "E7"]);
  });

  it("changes note names while preserving modal degree structure", () => {
    const c = buildScale(createContext("C", "dorian"));
    const d = buildScale(createContext("D", "dorian"));
    expect(c.map((tone) => tone.degreeLabel)).toEqual(d.map((tone) => tone.degreeLabel));
    expect(c.map((tone) => tone.name)).not.toEqual(d.map((tone) => tone.name));
  });

  it("uses diatonic spelling and accidental Roman numerals", () => {
    expect(buildScale(createContext("F#", "major")).map((tone) => tone.name))
      .toEqual(["F#", "G#", "A#", "B", "C#", "D#", "E#"]);
    expect(buildChords(createContext("C", "mixolydian"))[6].roman).toBe("bVII");
  });
});
