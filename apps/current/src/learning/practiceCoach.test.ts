import { describe, expect, it } from "vitest";
import { buildChords, buildScale, createContext, MODES, normalize } from "../core/music/theory";
import type { ModeId } from "../core/music/types";
import { createCoachPrompt } from "./practiceCoach";
import type { CoachDifficulty, CoachMode } from "./practiceCoach";

const context = createContext("C", "major");
const scale = buildScale(context);
const chord = buildChords(context)[0];

describe("V7 guitar practice coach", () => {
  it("generates every playable prompt family at every difficulty", () => {
    const modes: CoachMode[] = ["note-hunt", "interval-move", "chord-tone", "triad-shape"];
    const difficulties: CoachDifficulty[] = ["foundation", "moving", "challenge"];
    for (const difficulty of difficulties) {
      for (const [index, mode] of modes.entries()) {
        const prompt = createCoachPrompt(context, scale, chord, mode, difficulty, 20 + index);
        expect(prompt.mode).toBe(mode);
        expect(prompt.instruction.length).toBeGreaterThan(20);
        expect(prompt.answer.length).toBeGreaterThan(10);
        expect(prompt.whyItMatters.length).toBeGreaterThan(20);
        expect(prompt.fretEnd).toBeGreaterThanOrEqual(prompt.fretStart);
      }
    }
  });

  it("keeps interval answers relative to the stated physical root", () => {
    const prompt = createCoachPrompt(context, scale, chord, "interval-move", "moving", 31);
    expect(prompt.rootPosition).toBeDefined();
    expect(prompt.targetPitch).toBe(normalize(prompt.rootPosition!.pitchClass + prompt.targetInterval!));
    expect(prompt.answer).toContain("lands on");
  });

  it("reveals a complete compact triad shape", () => {
    const prompt = createCoachPrompt(context, scale, chord, "triad-shape", "challenge", 44);
    expect(prompt.shape?.positions).toHaveLength(3);
    expect(new Set(prompt.shape?.positions.map((position) => position.pitchClass)))
      .toEqual(new Set(chord.tones.slice(0, 3).map((tone) => tone.pitchClass)));
  });

  it("varies mixed sessions across all four prompt families", () => {
    const modes = new Set(Array.from({ length: 12 }, (_, seed) =>
      createCoachPrompt(context, scale, chord, "mixed", "foundation", seed).mode
    ));
    expect(modes).toEqual(new Set(["note-hunt", "interval-move", "chord-tone", "triad-shape"]));
  });

  it("finds a triad exercise for every supported tonal system", () => {
    for (const mode of Object.keys(MODES) as ModeId[]) {
      const localContext = createContext("C", mode);
      const localScale = buildScale(localContext);
      for (const [index, localChord] of buildChords(localContext).entries()) {
        const prompt = createCoachPrompt(
          localContext,
          localScale,
          localChord,
          "triad-shape",
          "challenge",
          index + 70
        );
        expect(prompt.shape?.positions).toHaveLength(3);
      }
    }
  });
});
