export interface GlossaryTerm {
  term: string;
  plain: string;
}

// Plain-language definitions for the recurring vocabulary across the app.
// Kept deliberately short and beginner-first — meaning before precision.
export const GLOSSARY: GlossaryTerm[] = [
  { term: "Tonic", plain: "The “home” note a piece feels centred on and wants to return to. In the key of C, that's C." },
  { term: "Key", plain: "The family of notes a piece mainly uses, named after its home note — e.g. “the key of G”." },
  { term: "Mode", plain: "A flavour of scale. Major sounds bright, minor sounds darker; Dorian and Mixolydian sit in between." },
  { term: "Scale degree", plain: "A note's number counting up from the tonic: 1 is home, 5 is strong and open, and so on." },
  { term: "Interval", plain: "The distance between two notes. A “third” skips one letter; a “fifth” is a strong, stable gap." },
  { term: "Semitone", plain: "The smallest step on a guitar — one fret. Two semitones make a whole tone." },
  { term: "Third (major/minor)", plain: "The note that colours a chord. A major third sounds happy; a minor third (one fret lower) sounds sad." },
  { term: "b3 / flat third", plain: "A minor third — the third lowered by one fret. The classic “bluesy” note against a major chord." },
  { term: "Triad", plain: "A basic three-note chord: root, third and fifth stacked together." },
  { term: "Chord", plain: "Two or more notes sounded together as a unit." },
  { term: "Root", plain: "The note a chord is named after and usually built from — the C in a C chord." },
  { term: "Inversion", plain: "The same chord with a different note in the bass, which shifts its character." },
  { term: "Voice leading", plain: "Moving between chords smoothly by keeping shared notes and shifting the rest as little as possible." },
  { term: "Common tone", plain: "A note shared by two chords that you can hold while other notes move." },
  { term: "Pulse", plain: "The steady beat you'd tap your foot to." },
  { term: "Subdivision", plain: "Dividing each beat into smaller even parts — e.g. counting “1 and 2 and”." },
  { term: "Syncopation", plain: "Accenting the off-beats so the rhythm leans and pushes against the pulse." },
  { term: "Articulation", plain: "How a note is started and shaped — smooth (legato), clipped (staccato) or accented." },
  { term: "Sustain / release", plain: "How long a note rings, and how you stop it — both are choices you control." },
  { term: "Motif", plain: "A short, memorable musical idea you can repeat and develop." },
  { term: "Transfer", plain: "Taking something you can do in one key or position and doing it somewhere new — the real sign you've learned it." },
  { term: "Diatonic", plain: "Notes or chords that belong to the current key. “Chromatic” means notes from outside it." }
];
