import { describe, expect, it } from "vitest";
import {
  analyzePitch,
  buildBorrowedChords,
  buildDiatonicChords,
  buildSecondaryDominants,
  buildScale,
  pitch
} from "./music";
import type { TonalContext } from "./types";

describe("contextual music model", () => {
  it("spells scales diatonically", () => {
    const context: TonalContext = { tonic: pitch("F#"), mode: "major" };
    expect(buildScale(context).map((tone) => tone.pitch.name)).toEqual([
      "F#",
      "G#",
      "A#",
      "B",
      "C#",
      "D#",
      "E#"
    ]);
  });

  it("uses correct major-key Roman numerals and functions", () => {
    const context: TonalContext = { tonic: pitch("C"), mode: "major" };
    const chords = buildDiatonicChords(context, true);
    expect(chords.map((chord) => chord.romanNumeral)).toEqual([
      "Imaj7",
      "ii7",
      "iii7",
      "IVmaj7",
      "V7",
      "vi7",
      "viiø7"
    ]);
    expect(chords[4].function).toBe("Dominant");
  });

  it("keeps tonic-relative and chord-relative roles distinct", () => {
    const context: TonalContext = { tonic: pitch("C"), mode: "major" };
    const dominant = buildDiatonicChords(context)[4];
    const analysis = analyzePitch(context, pitch("B").pitchClass, dominant);
    expect(analysis.scaleDegree?.degreeLabel).toBe("7");
    expect(analysis.chordTone?.intervalLabel).toBe("3");
  });

  it("labels modal alterations explicitly", () => {
    const context: TonalContext = { tonic: pitch("D"), mode: "phrygian" };
    const chords = buildDiatonicChords(context);
    expect(chords[1].romanNumeral).toBe("bII");
  });

  it("derives triads and seventh chords for every supported system", () => {
    const modes = [
      "major",
      "dorian",
      "phrygian",
      "lydian",
      "mixolydian",
      "minor",
      "locrian",
      "harmonic-minor"
    ] as const;
    for (const mode of modes) {
      const context: TonalContext = { tonic: pitch("C"), mode };
      expect(buildDiatonicChords(context)).toHaveLength(7);
      expect(buildDiatonicChords(context, true)).toHaveLength(7);
    }
  });

  it("derives secondary dominants relative to explicit targets", () => {
    const context: TonalContext = { tonic: pitch("C"), mode: "major" };
    const dominants = buildSecondaryDominants(context);
    expect(dominants.map((chord) => chord.romanNumeral)).toEqual([
      "V7/ii",
      "V7/iii",
      "V7/IV",
      "V7/V",
      "V7/vi"
    ]);
    expect(dominants.find((chord) => chord.romanNumeral === "V7/V")?.symbol).toBe(
      "D7"
    );
  });

  it("derives modal interchange from the parallel collection", () => {
    const context: TonalContext = { tonic: pitch("C"), mode: "major" };
    const borrowed = buildBorrowedChords(context);
    expect(borrowed.some((chord) => chord.romanNumeral === "iv")).toBe(true);
    expect(borrowed.some((chord) => chord.romanNumeral === "bVI")).toBe(true);
  });
});
