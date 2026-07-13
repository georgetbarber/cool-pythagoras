import { describe, expect, it } from "vitest";
import { buildChords, createContext } from "../core/music/theory";
import { generateShapes } from "../core/instrument/guitar";
import { assessFingering } from "../core/instrument/fingering";
import { analyzeChromaticPitch } from "../core/music/chromatic";
import { transformMotif } from "../core/music/motif";
import { transformRhythm, validateRhythm } from "../core/music/rhythm";
import { CURRICULUM, validateCurriculum } from "./curriculum";
import { DEFAULT_STATE } from "./store";
import { buildSession, createEvidence, masteryFor } from "./learning";
import { cloudProfile, cloudSketch, mergeCloudSnapshot } from "./sync";

describe("V8 musical-freedom foundations", () => {
  it("ships forty-eight validated core units with the complete activity contract", () => {
    expect(CURRICULUM).toHaveLength(48);
    expect(validateCurriculum()).toEqual([]);
    expect(CURRICULUM.every((unit) => unit.activities.some((activity) => activity.kind === "creative"))).toBe(true);
  });

  it("builds a balanced twenty-five-minute session", () => {
    const session = buildSession(DEFAULT_STATE, new Date("2026-07-13T09:00:00Z"));
    expect(session.totalMinutes).toBe(25);
    expect(session.items).toHaveLength(5);
    expect(session.items.some((item) => ["creative", "reflection"].includes(item.kind))).toBe(true);
  });

  it("uses the baseline only to choose the first recommended unit", () => {
    const state = { ...DEFAULT_STATE, settings: { ...DEFAULT_STATE.settings, startingBaseline: "secure" as const } };
    expect(buildSession(state, new Date("2026-07-13T09:00:00Z")).unitId).toBe("unit-07");
    expect(state.evidence).toEqual([]);
  });

  it("requires two independent days and transfer for transfer-ready mastery", () => {
    const context = { key: "C", mode: "major" as const, instrument: "electric" as const };
    const first = createEvidence("a", ["ear:u1"], "production", "none", "successful", context, "2026-07-10T10:00:00Z");
    const assisted = createEvidence("b", ["ear:u1"], "production", "hint", "successful", context, "2026-07-11T10:00:00Z");
    expect(masteryFor("ear:u1", [...first, ...assisted]).state).toBe("practising");
    const transfer = createEvidence("c", ["ear:u1"], "transfer", "none", "successful", { ...context, key: "D" }, "2026-07-12T10:00:00Z");
    expect(masteryFor("ear:u1", [...first, ...assisted, ...transfer]).state).toBe("transfer-ready");
  });

  it("describes chromatic pitches as relationships rather than errors", () => {
    const analysis = analyzeChromaticPitch(createContext("C", "major"), 1, 2);
    expect(analysis.relationship).toBe("chromatic-approach");
    expect(analysis.explanation).toContain("does not mean wrong");
  });

  it("transforms motifs and rhythms without mutating the source", () => {
    const motif = [{ pitch: 0, onset: 0, duration: 1 }, { pitch: 4, onset: 1, duration: 1 }];
    expect(transformMotif(motif, "invert").map((note) => note.pitch)).toEqual([0, 8]);
    const rhythm = { metre: "4/4" as const, subdivision: 2 as const, bars: 1, events: [{ beat: 0, duration: .5 }] };
    expect(validateRhythm(rhythm)).toEqual([]);
    expect(transformRhythm(rhythm, "rotate").events[0].beat).toBe(.5);
    expect(rhythm.events[0].beat).toBe(0);
  });

  it("labels generated shapes playable only after fingering assessment", () => {
    const chord = buildChords(createContext("C", "major"))[0];
    const shape = generateShapes(chord)[0];
    const assessment = assessFingering(shape);
    expect(assessment.assignments.length).toBeGreaterThan(0);
    expect(["high", "medium", "low"]).toContain(assessment.confidence);
  });

  it("merges append-only evidence and keeps the newest sketch without losing device recordings", () => {
    const local = {
      ...DEFAULT_STATE,
      updatedAt: "2026-07-13T10:00:00.000Z",
      evidence: createEvidence("local", ["ear:u1"], "production", "none", "successful", {}, "2026-07-13T09:00:00.000Z"),
      sketches: [{
        id: "sketch-1", name: "Local", intention: "", tags: [], tempo: 70, metre: "4/4" as const,
        key: "C", mode: "major" as const, chords: [], melody: [], rhythmPattern: "", bassMovement: "",
        sections: ["A"], notes: "old", ambiguityNotes: "", reflections: [], revisions: [], status: "capture" as const,
        takes: [{ id: "take-1", name: "Local take", createdAt: "2026-07-13T09:00:00.000Z", blobId: "blob-1", note: "" }],
        createdAt: "2026-07-13T08:00:00.000Z", updatedAt: "2026-07-13T09:00:00.000Z"
      }]
    };
    const remoteSketch = { ...local.sketches[0], name: "Remote revision", notes: "new", takes: [], updatedAt: "2026-07-13T11:00:00.000Z" };
    const remoteEvidence = createEvidence("remote", ["rhythm:u1"], "transfer", "none", "successful", {}, "2026-07-13T11:00:00.000Z");
    const merged = mergeCloudSnapshot(local, { sketches: [remoteSketch], evidence: remoteEvidence });
    expect(merged.evidence.map((item) => item.activityId)).toEqual(["local", "remote"]);
    expect(merged.sketches[0].name).toBe("Remote revision");
    expect(merged.sketches[0].takes).toHaveLength(1);
  });

  it("never includes recording metadata in a cloud sketch", () => {
    const sketch = { ...DEFAULT_STATE, sketches: [] };
    expect(cloudProfile(sketch).schemaVersion).toBe(1);
    const source = {
      id: "s", name: "Test", intention: "", tags: [], tempo: 70, metre: "4/4" as const, key: null, mode: null,
      chords: [], melody: [], rhythmPattern: "", bassMovement: "", sections: ["A"], notes: "", ambiguityNotes: "",
      takes: [{ id: "t", name: "Take", createdAt: "now", blobId: "private", note: "" }], revisions: [], reflections: [],
      status: "capture" as const, createdAt: "now", updatedAt: "now"
    };
    expect(cloudSketch(source).takes).toEqual([]);
  });

  it("uses deletion timestamps so an offline device cannot restore an old sketch", () => {
    const sketch = {
      id: "deleted", name: "Old idea", intention: "", tags: [], tempo: 70, metre: "4/4" as const, key: null, mode: null,
      chords: [], melody: [], rhythmPattern: "", bassMovement: "", sections: ["A"], notes: "", ambiguityNotes: "",
      takes: [], revisions: [], reflections: [], status: "capture" as const,
      createdAt: "2026-07-13T08:00:00.000Z", updatedAt: "2026-07-13T09:00:00.000Z"
    };
    const merged = mergeCloudSnapshot({ ...DEFAULT_STATE, deletedSketchIds: { deleted: "2026-07-13T10:00:00.000Z" } }, { sketches: [sketch] });
    expect(merged.sketches).toEqual([]);
  });
});
