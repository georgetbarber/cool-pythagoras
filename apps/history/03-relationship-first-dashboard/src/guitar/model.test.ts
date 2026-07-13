import { describe, expect, it } from "vitest";
import { buildDiatonicChords, pitch } from "../domain/music";
import { generateVoicings, positionsForPitchClass } from "./model";

describe("guitar model", () => {
  it("finds every root position through fret 15", () => {
    const positions = positionsForPitchClass(pitch("C").pitchClass);
    expect(positions.length).toBeGreaterThan(6);
    expect(positions.every((position) => position.fret <= 15)).toBe(true);
  });

  it("generates playable adjacent-string triads", () => {
    const chord = buildDiatonicChords({ tonic: pitch("C"), mode: "major" })[0];
    const voicings = generateVoicings(chord, { limit: 8 });
    expect(voicings.length).toBeGreaterThan(0);
    for (const voicing of voicings) {
      expect(voicing.positions).toHaveLength(3);
      expect(new Set(voicing.positions.map((position) => position.string)).size).toBe(3);
      expect(voicing.fretSpan).toBeLessThanOrEqual(4);
    }
  });
});
