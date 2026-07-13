import { describe, expect, it } from "vitest";
import { formatFretboardLabel } from "./Fretboard";

describe("reference-aware fretboard labels", () => {
  it("keeps tonal degree and chord role distinct in combined mode", () => {
    const cInEm = formatFretboardLabel({
      note: "C",
      scaleDegree: "1",
      chordInterval: null,
      labelMode: "combined",
      chordSymbol: "Em",
      tonicName: "C"
    });
    const eInEm = formatFretboardLabel({
      note: "E",
      scaleDegree: "3",
      chordInterval: "1",
      labelMode: "combined",
      chordSymbol: "Em",
      tonicName: "C"
    });
    expect(cInEm.primary).toBe("D1");
    expect(eInEm.primary).toBe("D3 · C1");
    expect(eInEm.degreeRole).toBe("D3");
    expect(eInEm.chordRole).toBe("C1");
  });

  it("prefixes single-reference modes", () => {
    expect(formatFretboardLabel({
      note: "B",
      scaleDegree: "7",
      chordInterval: "5",
      labelMode: "degree",
      chordSymbol: "Em",
      tonicName: "C"
    }).primary).toBe("D7");
    expect(formatFretboardLabel({
      note: "B",
      scaleDegree: "7",
      chordInterval: "5",
      labelMode: "chord",
      chordSymbol: "Em",
      tonicName: "C"
    }).primary).toBe("C5");
  });

  it("prefixes interval-lab labels with their physical-root reference", () => {
    expect(formatFretboardLabel({
      note: "G",
      scaleDegree: "5",
      chordInterval: null,
      labelMode: "degree",
      chordSymbol: "C",
      tonicName: "C",
      relationshipInterval: "5",
      semitones: 7
    }).primary).toBe("I5");
  });
});

