import { describe, expect, it } from "vitest";
import {
  analyzeRelationship,
  buildChords,
  buildScale,
  chordToneDisplayLabel,
  createContext
} from "./theory";

describe("V7 contextual music model", () => {
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

  it("spells the blues collection by scale degree rather than chromatic shorthand", () => {
    expect(buildScale(createContext("C", "blues")).map((tone) => tone.name))
      .toEqual(["C", "Eb", "F", "Gb", "G", "Bb"]);
  });

  it("builds and labels diatonic half-diminished seventh chords", () => {
    const cMajor = buildChords(createContext("C", "major"), true);
    const aMinor = buildChords(createContext("A", "minor"), true);
    expect(cMajor[6]).toMatchObject({ symbol: "Bm7b5", roman: "viiø7", quality: "half-diminished7" });
    expect(aMinor[1]).toMatchObject({ symbol: "Bm7b5", roman: "iiø7", quality: "half-diminished7" });
  });

  it("describes modal function without implying classical dominant pull", () => {
    expect(buildChords(createContext("A", "minor"))[4].functionLabel).toBe("Modal dominant");
    expect(buildChords(createContext("C", "mixolydian"))[6].functionLabel).toBe("bVII return");
    expect(buildChords(createContext("D", "dorian"))[3].functionLabel).toBe("Characteristic IV");
  });

  it("formats chord roles without ambiguous note-name initials", () => {
    expect(chordToneDisplayLabel("1")).toBe("root");
    expect(chordToneDisplayLabel("3")).toBe("3rd");
    expect(chordToneDisplayLabel("b3")).toBe("♭3");
    expect(chordToneDisplayLabel("b7")).toBe("♭7");
  });
});
