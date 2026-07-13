import { describe, expect, it } from "vitest";
import { assessPitch, assessRhythm, detectPitch, isOnset } from "./analysis";

describe("V6 performance analysis", () => {
  it("detects a monophonic guitar-range sine wave", () => {
    const sampleRate = 48000;
    const frequency = 110;
    const samples = Float32Array.from(
      { length: 4096 },
      (_, index) => Math.sin((2 * Math.PI * frequency * index) / sampleRate) * 0.6
    );
    expect(detectPitch(samples, sampleRate)).toBeCloseTo(frequency, 0);
    expect(assessPitch(frequency, 45)).toMatchObject({ verdict: "in-tune", direction: "hold" });
  });

  it("rejects silence and detects a clear attack", () => {
    expect(detectPitch(new Float32Array(2048), 48000)).toBeNull();
    expect(isOnset(0.01, 0.08)).toBe(true);
    expect(isOnset(0.06, 0.07)).toBe(false);
  });

  it("scores four near-beat attacks separately from late or missing attacks", () => {
    const locked = assessRhythm([1010, 1490, 2020, 2495], [1000, 1500, 2000, 2500]);
    const loose = assessRhythm([1150, 1830], [1000, 1500, 2000, 2500]);
    expect(locked).toMatchObject({ hits: 4, verdict: "locked" });
    expect(loose.accuracy).toBeLessThan(locked.accuracy);
  });
});
