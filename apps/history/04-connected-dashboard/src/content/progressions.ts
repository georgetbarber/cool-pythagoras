import type { ProgressionDefinition, TonalContext, Chord } from "../domain/types";
import { buildChordFromDegree, buildDiatonicChords } from "../domain/music";

export const PROGRESSIONS: readonly ProgressionDefinition[] = [
  {
    id: "one-four-five",
    name: "Departure and return",
    category: "Foundations",
    formula: "I – IV – V – I",
    description: "The clearest route from stability through preparation and tension back home.",
    learningFocus: "Hear tonic, predominant, dominant, and resolution as four different states.",
    mode: "major",
    sevenths: false,
    steps: [{ degree: 1 }, { degree: 4 }, { degree: 5 }, { degree: 1 }],
    tags: ["cadence", "function", "beginner"]
  },
  {
    id: "one-five-six-four",
    name: "Pop axis",
    category: "Pop & rock",
    formula: "I – V – vi – IV",
    description: "A circular loop connected by common tones and small melodic movements.",
    learningFocus: "Track which chord tones remain common while bass roots make larger jumps.",
    mode: "major",
    sevenths: false,
    steps: [{ degree: 1 }, { degree: 5 }, { degree: 6 }, { degree: 4 }],
    tags: ["pop", "rock", "loop"]
  },
  {
    id: "fifties",
    name: "Fifties turnaround",
    category: "Pop & rock",
    formula: "I – vi – IV – V",
    description: "Classic doo-wop motion from tonic through its relative minor into a cadence.",
    learningFocus: "Hear vi as tonic expansion before IV and V create departure and return.",
    mode: "major",
    sevenths: false,
    steps: [{ degree: 1 }, { degree: 6 }, { degree: 4 }, { degree: 5 }],
    tags: ["doo-wop", "turnaround", "songwriting"]
  },
  {
    id: "andalusian",
    name: "Andalusian cadence",
    category: "Minor",
    formula: "i – bVII – bVI – V",
    description: "Descending minor-key bass motion that intensifies toward a major dominant.",
    learningFocus: "Compare natural-minor colour with the raised leading tone inside V.",
    mode: "minor",
    sevenths: false,
    steps: [
      { degree: 1 },
      { degree: 7 },
      { degree: 6 },
      { degree: 5, quality: "major", roman: "V", label: "Harmonic-minor dominant" }
    ],
    tags: ["minor", "flamenco", "descending bass"]
  },
  {
    id: "minor-pop",
    name: "Minor pop loop",
    category: "Minor",
    formula: "i – bVI – bIII – bVII",
    description: "A broad natural-minor loop with no raised leading tone.",
    learningFocus: "Hear modal colour and bass movement without classical dominant resolution.",
    mode: "minor",
    sevenths: false,
    steps: [{ degree: 1 }, { degree: 6 }, { degree: 3 }, { degree: 7 }],
    tags: ["minor", "pop", "modal"]
  },
  {
    id: "twelve-bar",
    name: "12-bar blues",
    category: "Blues",
    formula: "I7 I7 I7 I7 | IV7 IV7 I7 I7 | V7 IV7 I7 V7",
    description: "The foundational blues form, using dominant colour on tonic, subdominant, and dominant.",
    learningFocus: "Notice that dominant-seventh quality does not always mean dominant function.",
    mode: "major",
    sevenths: true,
    steps: [
      { degree: 1, quality: "dominant7", roman: "I7", label: "Blues tonic" },
      { degree: 1, quality: "dominant7", roman: "I7", label: "Blues tonic" },
      { degree: 1, quality: "dominant7", roman: "I7", label: "Blues tonic" },
      { degree: 1, quality: "dominant7", roman: "I7", label: "Blues tonic" },
      { degree: 4, quality: "dominant7", roman: "IV7", label: "Blues subdominant" },
      { degree: 4, quality: "dominant7", roman: "IV7", label: "Blues subdominant" },
      { degree: 1, quality: "dominant7", roman: "I7", label: "Blues tonic" },
      { degree: 1, quality: "dominant7", roman: "I7", label: "Blues tonic" },
      { degree: 5, quality: "dominant7", roman: "V7", label: "Blues dominant" },
      { degree: 4, quality: "dominant7", roman: "IV7", label: "Blues subdominant" },
      { degree: 1, quality: "dominant7", roman: "I7", label: "Blues tonic" },
      { degree: 5, quality: "dominant7", roman: "V7", label: "Turnaround dominant" }
    ],
    tags: ["blues", "12-bar", "dominant seventh"]
  },
  {
    id: "quick-change-blues",
    name: "Quick-change blues",
    category: "Blues",
    formula: "I7 IV7 I7 I7 | IV7 IV7 I7 I7 | V7 IV7 I7 V7",
    description: "A 12-bar blues that introduces IV7 in bar two.",
    learningFocus: "Hear the early move to IV as colour before the main structural departure.",
    mode: "major",
    sevenths: true,
    steps: [
      { degree: 1, quality: "dominant7", roman: "I7" },
      { degree: 4, quality: "dominant7", roman: "IV7" },
      { degree: 1, quality: "dominant7", roman: "I7" },
      { degree: 1, quality: "dominant7", roman: "I7" },
      { degree: 4, quality: "dominant7", roman: "IV7" },
      { degree: 4, quality: "dominant7", roman: "IV7" },
      { degree: 1, quality: "dominant7", roman: "I7" },
      { degree: 1, quality: "dominant7", roman: "I7" },
      { degree: 5, quality: "dominant7", roman: "V7" },
      { degree: 4, quality: "dominant7", roman: "IV7" },
      { degree: 1, quality: "dominant7", roman: "I7" },
      { degree: 5, quality: "dominant7", roman: "V7" }
    ],
    tags: ["blues", "12-bar", "quick change"]
  },
  {
    id: "jazz-two-five-one",
    name: "Major ii–V–I",
    category: "Jazz",
    formula: "ii7 – V7 – Imaj7",
    description: "The central directed cadence of tonal jazz harmony.",
    learningFocus: "Follow the seventh of ii into the third of V, then the seventh of V into the third of I.",
    mode: "major",
    sevenths: true,
    steps: [{ degree: 2 }, { degree: 5 }, { degree: 1 }],
    tags: ["jazz", "cadence", "voice leading"]
  },
  {
    id: "minor-two-five-one",
    name: "Minor iiø–V–i",
    category: "Jazz",
    formula: "iiø7 – V7 – i(maj7)",
    description: "Minor-key jazz cadence with altered predominant and strong dominant pull.",
    learningFocus: "Hear b6 and the leading tone define the move into minor tonic.",
    mode: "harmonic-minor",
    sevenths: true,
    steps: [{ degree: 2 }, { degree: 5 }, { degree: 1 }],
    tags: ["jazz", "minor", "cadence"]
  },
  {
    id: "six-two-five-one",
    name: "Jazz turnaround",
    category: "Jazz",
    formula: "vi7 – ii7 – V7 – Imaj7",
    description: "A cycle-driven turnaround that extends the ii–V–I backwards.",
    learningFocus: "Hear descending fifths as a chain of temporary goals.",
    mode: "major",
    sevenths: true,
    steps: [{ degree: 6 }, { degree: 2 }, { degree: 5 }, { degree: 1 }],
    tags: ["jazz", "turnaround", "cycle"]
  },
  {
    id: "three-six-two-five",
    name: "Rhythm-changes turnaround",
    category: "Jazz",
    formula: "iii7 – VI7 – ii7 – V7",
    description: "A jazz turnaround where VI7 tonicizes ii before the main ii–V.",
    learningFocus: "Compare diatonic vi with chromatic VI7 and hear its temporary target.",
    mode: "major",
    sevenths: true,
    steps: [
      { degree: 3 },
      { degree: 6, quality: "dominant7", roman: "VI7", label: "V7/ii" },
      { degree: 2 },
      { degree: 5 }
    ],
    tags: ["jazz", "rhythm changes", "secondary dominant"]
  },
  {
    id: "circle-sequence",
    name: "Circle sequence",
    category: "Jazz",
    formula: "iii7 – vi7 – ii7 – V7 – Imaj7",
    description: "Descending fifth relationships lead progressively toward tonic.",
    learningFocus: "See each root become the temporary destination of the chord before it.",
    mode: "major",
    sevenths: true,
    steps: [{ degree: 3 }, { degree: 6 }, { degree: 2 }, { degree: 5 }, { degree: 1 }],
    tags: ["jazz", "circle", "functional"]
  },
  {
    id: "dorian-vamp",
    name: "Dorian vamp",
    category: "Modal",
    formula: "i7 – IV7",
    description: "A modal loop that exposes Dorian's natural sixth through major IV.",
    learningFocus: "Keep the tonic fixed and hear the natural sixth as the defining colour.",
    mode: "dorian",
    sevenths: true,
    steps: [{ degree: 1 }, { degree: 4 }],
    tags: ["modal", "dorian", "vamp"]
  },
  {
    id: "mixolydian-rock",
    name: "Mixolydian rock",
    category: "Modal",
    formula: "I – bVII – IV – I",
    description: "A major-centred loop whose bVII avoids classical leading-tone resolution.",
    learningFocus: "Compare bVII–I modal return with V–I dominant resolution.",
    mode: "mixolydian",
    sevenths: false,
    steps: [{ degree: 1 }, { degree: 7 }, { degree: 4 }, { degree: 1 }],
    tags: ["modal", "rock", "mixolydian"]
  },
  {
    id: "backdoor",
    name: "Backdoor cadence",
    category: "Chromatic",
    formula: "iv7 – bVII7 – Imaj7",
    description: "Borrowed minor-subdominant motion resolves to major tonic through bVII7.",
    learningFocus: "Hear semitone voice leading substitute for the conventional V–I route.",
    mode: "minor",
    sevenths: true,
    steps: [
      { degree: 4, quality: "minor7", roman: "iv7", label: "Borrowed predominant" },
      { degree: 7, quality: "dominant7", roman: "bVII7", label: "Backdoor dominant" },
      { degree: 1, quality: "major7", roman: "Imaj7", label: "Major tonic" }
    ],
    tags: ["jazz", "borrowed", "cadence"]
  }
];

export function progressionById(id: string): ProgressionDefinition {
  return PROGRESSIONS.find((progression) => progression.id === id) ?? PROGRESSIONS[0];
}

export function buildProgressionChords(
  currentContext: TonalContext,
  definition: ProgressionDefinition
): Chord[] {
  const context = {
    ...currentContext,
    mode: definition.mode === "current" ? currentContext.mode : definition.mode
  };
  const diatonic = buildDiatonicChords(context, definition.sevenths);
  return definition.steps.map((step, index) => {
    if (!step.quality) {
      return { ...diatonic[step.degree - 1], id: `${definition.id}-${index}-${diatonic[step.degree - 1].id}` };
    }
    return {
      ...buildChordFromDegree(context, step.degree, step.quality, step.roman, step.label),
      id: `${definition.id}-${index}-${step.degree}-${step.quality}`
    };
  });
}
