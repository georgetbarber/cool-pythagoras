import { describe, expect, it } from "vitest";
import { buildDiatonicChords, pitch } from "../domain/music";
import { generateVoicings, stringCountFor } from "./guitar";

describe("adaptive V4 guitar model", () => {
  it("uses one string per unique chord tone in auto mode", () => {
    const triad = buildDiatonicChords({ tonic: pitch("C"), mode: "major" })[0];
    const seventh = buildDiatonicChords({ tonic: pitch("C"), mode: "major" }, true)[0];
    expect(stringCountFor(triad, "auto")).toBe(3);
    expect(stringCountFor(seventh, "auto")).toBe(4);
  });

  it("produces complete four-string seventh voicings", () => {
    const chord = buildDiatonicChords({ tonic: pitch("C"), mode: "major" }, true)[0];
    const voicings = generateVoicings(chord, "auto", { limit: 12 });
    expect(voicings.length).toBeGreaterThan(0);
    expect(voicings.every((voicing) => voicing.positions.length === 4)).toBe(true);
    expect(voicings.every((voicing) => voicing.omittedPitchClasses.length === 0)).toBe(true);
  });

  it("does not misreport remote open-string shapes as span zero", () => {
    const chord = buildDiatonicChords({ tonic: pitch("C"), mode: "major" }, true)[0];
    const voicings = generateVoicings(chord, 4, { limit: 50 });
    expect(voicings.some((voicing) =>
      voicing.physicalSpan === 0 &&
      voicing.positions.some((position) => position.fret === 0) &&
      voicing.positions.some((position) => position.fret >= 10)
    )).toBe(false);
  });
});

