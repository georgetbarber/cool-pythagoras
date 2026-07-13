import { describe, expect, it } from "vitest";
import { MODE_INTERVALS } from "./constants";
import {
  buildDiatonicChords,
  getScalePitchClasses,
  spellScale
} from "./theory";
import type { KeySelection, ModeId } from "./types";

describe("theory engine", () => {
  it("spells difficult keys by letter rather than replacing pitch names", () => {
    const key: KeySelection = { tonic: "C#", tonicPc: 1, mode: "major" };
    expect(spellScale(key)).toEqual(["C#", "D#", "E#", "F#", "G#", "A#", "B#"]);
  });

  it("uses the correct interval collection for every supported mode", () => {
    const modes = Object.keys(MODE_INTERVALS) as ModeId[];
    for (const mode of modes) {
      const key: KeySelection = { tonic: "C", tonicPc: 0, mode };
      expect(getScalePitchClasses(key)).toEqual(MODE_INTERVALS[mode]);
    }
  });

  it("derives seven valid triads and seventh chords for every mode", () => {
    const modes = Object.keys(MODE_INTERVALS) as ModeId[];
    for (const mode of modes) {
      const key: KeySelection = { tonic: "D", tonicPc: 2, mode };
      expect(buildDiatonicChords(key)).toHaveLength(7);
      expect(buildDiatonicChords(key, true)).toHaveLength(7);
    }
  });

  it("exposes the characteristic major IV in Dorian", () => {
    const chords = buildDiatonicChords({ tonic: "D", tonicPc: 2, mode: "dorian" });
    expect(chords[3]).toMatchObject({
      rootName: "G",
      quality: "Major",
      numeral: "IV"
    });
  });
});
