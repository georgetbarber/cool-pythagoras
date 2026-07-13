import type { Tuning } from "../domain/types";

export const TUNINGS: readonly Tuning[] = [
  {
    id: "standard",
    name: "Standard E",
    openMidi: [64, 59, 55, 50, 45, 40],
    labels: ["e", "B", "G", "D", "A", "E"]
  },
  {
    id: "drop-d",
    name: "Drop D",
    openMidi: [64, 59, 55, 50, 45, 38],
    labels: ["e", "B", "G", "D", "A", "D"]
  },
  {
    id: "open-g",
    name: "Open G",
    openMidi: [62, 59, 55, 50, 43, 38],
    labels: ["d", "B", "G", "D", "G", "D"]
  },
  {
    id: "dadgad",
    name: "DADGAD",
    openMidi: [62, 57, 55, 50, 45, 38],
    labels: ["d", "A", "G", "D", "A", "D"]
  }
];

export function getTuning(id: string): Tuning {
  return TUNINGS.find((tuning) => tuning.id === id) ?? TUNINGS[0];
}
