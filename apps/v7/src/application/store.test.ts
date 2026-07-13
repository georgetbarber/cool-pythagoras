import { describe, expect, it } from "vitest";
import { appReducer, DEFAULT_STATE } from "./store";

describe("V7 application state", () => {
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
    expect(changed.selectedShapeIndex).toBe(0);
  });

  it("does not complete a lesson when it is cancelled", () => {
    const started = appReducer(DEFAULT_STATE, { type: "startLesson", id: "tonal-home" });
    const cancelled = appReducer(started, { type: "cancelLesson" });
    expect(cancelled.learning.currentLessonId).toBeNull();
    expect(cancelled.learning.completedLessons).not.toContain("tonal-home");
  });

  it("stores practice evidence under the active tonal context", () => {
    const changed = appReducer(DEFAULT_STATE, { type: "recordExercise", skill: "degree-3", correct: true });
    expect(changed.learning.skills["degree-3"].contexts["C-major"]).toEqual({ attempts: 1, correct: 1 });
  });

  it("resets the selected voicing when chord structure changes", () => {
    const selected = appReducer(DEFAULT_STATE, { type: "selectShape", index: 4 });
    const changed = appReducer(selected, { type: "toggleSevenths" });
    expect(changed.sevenths).toBe(true);
    expect(changed.selectedShapeIndex).toBe(0);
  });
});
