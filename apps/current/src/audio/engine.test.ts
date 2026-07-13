import { afterEach, describe, expect, it, vi } from "vitest";
import { startVoicingProgression } from "./engine";

describe("audio progression scheduling", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("schedules voicings from their stored beat durations", () => {
    const setTimeout = vi.fn((_callback: TimerHandler, _delay?: number) => setTimeout.mock.calls.length);
    vi.stubGlobal("window", { setTimeout, clearTimeout: vi.fn() });
    startVoicingProgression([[60], [62], [64]], 60, () => undefined, [2, 4, 8]);
    expect(setTimeout.mock.calls.map((call) => call[1])).toEqual([0, 2000, 6000, 14000]);
  });
});
