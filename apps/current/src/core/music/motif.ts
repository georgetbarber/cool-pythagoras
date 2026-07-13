import { normalize } from "./theory";

export interface MotifNote {
  pitch: number;
  onset: number;
  duration: number;
  accent?: boolean;
}

export type MotifOperation = "transpose" | "invert" | "retrograde" | "augment" | "diminish";

export function transformMotif(notes: readonly MotifNote[], operation: MotifOperation, amount = 0): MotifNote[] {
  if (!notes.length) return [];
  if (operation === "transpose") return notes.map((note) => ({ ...note, pitch: normalize(note.pitch + amount) }));
  if (operation === "invert") {
    const axis = notes[0].pitch;
    return notes.map((note) => ({ ...note, pitch: normalize(axis - (note.pitch - axis)) }));
  }
  if (operation === "retrograde") {
    const end = Math.max(...notes.map((note) => note.onset + note.duration));
    return [...notes].reverse().map((note) => ({ ...note, onset: end - note.onset - note.duration }));
  }
  const factor = operation === "augment" ? 2 : 0.5;
  return notes.map((note) => ({ ...note, onset: note.onset * factor, duration: note.duration * factor }));
}

export function motifFingerprint(notes: readonly MotifNote[]): string {
  if (notes.length < 2) return "single event";
  return notes.slice(1).map((note, index) => {
    const previous = notes[index];
    const movement = note.pitch - previous.pitch;
    return movement === 0 ? "same" : movement > 0 ? `up${movement}` : `down${Math.abs(movement)}`;
  }).join(" · ");
}
