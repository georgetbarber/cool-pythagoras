import type { Depth, WorkspaceId } from "../domain/types";

export interface LearningConcept {
  id: string;
  title: string;
  level: Depth;
  workspace: WorkspaceId;
  outcome: string;
  activity: string;
  prerequisites: readonly string[];
}

export const CURRICULUM: readonly LearningConcept[] = [
  {
    id: "tonal-centre",
    title: "Hear a tonal centre",
    level: "essential",
    workspace: "learn",
    outcome: "Recognize a note as home rather than an isolated pitch.",
    activity: "Hear a tonic drone, then compare other notes against it.",
    prerequisites: []
  },
  {
    id: "roots-octaves",
    title: "Map roots and octaves",
    level: "essential",
    workspace: "fretboard",
    outcome: "Locate the tonal centre across strings and registers.",
    activity: "Find every tonic and connect repeated octave shapes.",
    prerequisites: ["tonal-centre"]
  },
  {
    id: "scale-degrees",
    title: "See scale degrees",
    level: "essential",
    workspace: "explore",
    outcome: "Name notes by their relationship to the tonic.",
    activity: "Switch between note and degree labels without changing positions.",
    prerequisites: ["roots-octaves"]
  },
  {
    id: "triad-structure",
    title: "Build triads from intervals",
    level: "essential",
    workspace: "harmony",
    outcome: "Understand how 1, 3, and 5 create chord quality.",
    activity: "Construct I, IV, and V on three adjacent strings.",
    prerequisites: ["scale-degrees"]
  },
  {
    id: "functional-motion",
    title: "Hear function and resolution",
    level: "essential",
    workspace: "progressions",
    outcome: "Distinguish rest, departure, tension, and return.",
    activity: "Trace I-IV-V-I while watching common and moving tones.",
    prerequisites: ["triad-structure"]
  },
  {
    id: "triad-network",
    title: "Connect triads across the neck",
    level: "expanded",
    workspace: "fretboard",
    outcome: "See one chord as a network of related inversions.",
    activity: "Move through adjacent string groups and nearest inversions.",
    prerequisites: ["triad-structure"]
  },
  {
    id: "seventh-function",
    title: "Add sevenths and tendency tones",
    level: "expanded",
    workspace: "harmony",
    outcome: "Hear how sevenths clarify harmonic function.",
    activity: "Compare triads with diatonic seventh chords.",
    prerequisites: ["functional-motion"]
  },
  {
    id: "modal-colour",
    title: "Compare parallel modes",
    level: "expanded",
    workspace: "explore",
    outcome: "Identify the degree that gives each mode its character.",
    activity: "Hold the tonic constant while changing mode.",
    prerequisites: ["scale-degrees"]
  },
  {
    id: "voice-leading",
    title: "Minimize voice movement",
    level: "expanded",
    workspace: "progressions",
    outcome: "Choose shapes by how their individual voices connect.",
    activity: "Compare connected and positionally disconnected progressions.",
    prerequisites: ["triad-network", "functional-motion"]
  },
  {
    id: "secondary-dominants",
    title: "Tonicize temporary goals",
    level: "advanced",
    workspace: "advanced",
    outcome: "Understand a dominant relative to its temporary target.",
    activity: "Analyze V/x as both chromatic harmony and directed motion.",
    prerequisites: ["seventh-function", "voice-leading"]
  },
  {
    id: "modal-interchange",
    title: "Borrow parallel-mode colors",
    level: "advanced",
    workspace: "advanced",
    outcome: "Relate borrowed chords to altered scale degrees.",
    activity: "Compare diatonic and parallel-mode versions of one degree.",
    prerequisites: ["modal-colour", "functional-motion"]
  },
  {
    id: "reharmonization",
    title: "Reinterpret melodic notes",
    level: "advanced",
    workspace: "advanced",
    outcome: "Choose alternate harmony by chord-tone role and voice movement.",
    activity: "Hold a melody note while comparing several harmonic contexts.",
    prerequisites: ["secondary-dominants", "modal-interchange"]
  }
];

export function availableConcepts(
  completed: readonly string[],
  depth: Depth
): LearningConcept[] {
  const levels: Depth[] =
    depth === "essential"
      ? ["essential"]
      : depth === "expanded"
        ? ["essential", "expanded"]
        : ["essential", "expanded", "advanced"];
  return CURRICULUM.filter(
    (concept) =>
      levels.includes(concept.level) &&
      concept.prerequisites.every((prerequisite) => completed.includes(prerequisite))
  );
}
