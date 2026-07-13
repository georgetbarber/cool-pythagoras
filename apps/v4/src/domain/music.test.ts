import { describe, expect, it } from "vitest";
import {
  analyzeRelationship,
  buildBorrowedChords,
  buildDiatonicChords,
  buildScale,
  buildSecondaryDominants,
  pitch
} from "./music";

describe("V4 relationship domain", () => {
  it("spells scales according to their tonal context", () => {
    expect(buildScale({ tonic: pitch("F#"), mode: "major" }).map((tone) => tone.pitch.name))
      .toEqual(["F#", "G#", "A#", "B", "C#", "D#", "E#"]);
  });

  it("distinguishes chord quality from harmonic function", () => {
    const chords = buildDiatonicChords({ tonic: pitch("C"), mode: "major" }, true);
    expect(chords[6].symbol).toBe("Bm7b5");
    expect(chords[6].romanNumeral).toBe("viiø7");
    expect(chords[6].functionLabel).toBe("Leading-tone chord");
    expect(chords[6].functionFamily).toBe("Dominant function");
  });

  it("keeps tonic-relative and chord-relative roles distinct", () => {
    const context = { tonic: pitch("C"), mode: "major" as const };
    const dominant = buildDiatonicChords(context)[4];
    const relationship = analyzeRelationship(context, pitch("B").pitchClass, dominant);
    expect(relationship.scaleTone?.degreeLabel).toBe("7");
    expect(relationship.chordTone?.intervalLabel).toBe("3");
    expect(relationship.tendency).toContain("Leading tone");
  });

  it("builds contextual chromatic harmony", () => {
    const context = { tonic: pitch("C"), mode: "major" as const };
    expect(buildBorrowedChords(context).some((chord) => chord.romanNumeral === "iv")).toBe(true);
    expect(buildSecondaryDominants(context).map((chord) => chord.romanNumeral))
      .toEqual(["V7/ii", "V7/iii", "V7/IV", "V7/V", "V7/vi"]);
  });
});

