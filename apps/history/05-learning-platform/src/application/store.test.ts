import { describe, expect, it } from "vitest";
import { appReducer, DEFAULT_STATE } from "./store";

describe("V5 application state", () => {
  it("changes context and resets contextual selections", () => {
    const selected = appReducer(DEFAULT_STATE, {
      type: "selectPosition",
      string: 2,
      fret: 5,
      pitchClass: 0
    });
    const changed = appReducer(selected, { type: "setContext", tonicName: "D", mode: "dorian" });
    expect(changed.context).toMatchObject({ tonicName: "D", mode: "dorian", tonic: 2 });
    expect(changed.selectedPosition).toBeNull();
    expect(changed.selectedPitch).toBe(2);
  });

  it("does not complete a lesson when it is cancelled", () => {
    const started = appReducer(DEFAULT_STATE, { type: "startLesson", id: "tonal-home" });
    const cancelled = appReducer(started, { type: "cancelLesson" });
    expect(cancelled.learning.currentLessonId).toBeNull();
    expect(cancelled.learning.completedLessons).not.toContain("tonal-home");
  });
});
