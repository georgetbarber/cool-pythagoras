export const INTERVALS = [
  { label: "1 / 8ve", short: "same pitch", description: "The same pitch class: unison nearby, octave equivalent in another register." },
  { label: "b2", short: "minor 2nd", description: "Close friction with strong semitone pull." },
  { label: "2", short: "major 2nd", description: "Open stepwise motion and melodic possibility." },
  { label: "b3", short: "minor 3rd", description: "The interval that defines minor chord colour." },
  { label: "3", short: "major 3rd", description: "The interval that defines major chord colour." },
  { label: "4", short: "perfect 4th", description: "Open and neutral melodically; in a sus4 chord it takes the third's place and typically resolves down to it." },
  { label: "b5", short: "tritone", description: "Maximum instability, often resolving by semitone. Spelled ♯4 or ♭5 depending on direction; this app labels it ♭5." },
  { label: "5", short: "perfect 5th", description: "Structural stability that strongly supports the root." },
  { label: "b6", short: "minor 6th", description: "Dark colour with a common downward pull." },
  { label: "6", short: "major 6th", description: "Warm openness and a defining modal colour." },
  { label: "b7", short: "minor 7th", description: "Dominant or modal colour that often falls by step." },
  { label: "7", short: "major 7th", description: "Leading tension one semitone below the octave." }
] as const;
