import { describe, expect, it } from "vitest";
import { createStandaloneChord, getChordPitchClasses } from "../domain/theory";
import { getTuning } from "./tunings";
import { solveVoicing } from "./voicing";

describe("voicing solver", () => {
  it("returns one note per string inside the requested fret span", () => {
    const chord = createStandaloneChord(0, "C", "Major 7");
    const voicing = solveVoicing(chord, getTuning("standard"), {
      mode: "drop2",
      cagedShape: "off"
    });
    expect(voicing).not.toBeNull();
    expect(voicing!.positions).toHaveLength(4);
    expect(new Set(voicing!.positions.map((position) => position.string)).size).toBe(4);
    expect(voicing!.fretSpan).toBeLessThanOrEqual(4);
  });

  it("represents every triad pitch class", () => {
    const chord = createStandaloneChord(9, "A", "Minor");
    const voicing = solveVoicing(chord, getTuning("drop-d"), {
      mode: "triad",
      cagedShape: "A"
    });
    expect(voicing).not.toBeNull();
    const represented = new Set(
      voicing!.positions.map((position) => position.pitchClass)
    );
    getChordPitchClasses(chord.rootPc, chord.quality).forEach((pitchClass) =>
      expect(represented.has(pitchClass)).toBe(true)
    );
  });

  it("preserves defining tones when reducing an extended chord", () => {
    const chord = createStandaloneChord(0, "C", "Dominant 13");
    const voicing = solveVoicing(chord, getTuning("standard"), {
      mode: "compact",
      cagedShape: "E"
    });
    expect(voicing).not.toBeNull();
    const represented = new Set(
      voicing!.positions.map((position) => position.pitchClass)
    );
    expect(represented.has(0)).toBe(true);
    expect(represented.has(4)).toBe(true);
    expect(represented.has(10)).toBe(true);
    expect(represented.has(9)).toBe(true);
  });
});
