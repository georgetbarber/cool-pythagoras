// Micro-study lines are a deliberately mixed notation: real guitar tab, scale-degree
// numbers, Roman-numeral chords, note names, count rows, accent rows and plain guidance.
// Showing all of them under a single "tab" heading is a known point of confusion, so we
// classify each line conservatively and only label the ones we're confident about.

export type NotationType = "tab" | "count" | "accents" | "degrees" | "chords" | "notes" | "guide";

export interface LabeledLine {
  text: string;
  type: NotationType;
}

const ROMAN = /^(b|#)?(VII|VI|IV|V|III|II|I|vii|vi|iv|v|iii|ii|i)7?$/;
const WORD_LABEL = /^[A-Za-z]+:$/; // e.g. "top:", "bass:", "Dorian:"

export function classifyLine(raw: string): NotationType {
  const line = raw.trim();
  if (!line) return "guide";
  if (/^[\s>]+$/.test(raw) && raw.includes(">")) return "accents";
  // Real tab always has a string letter, a bar, then a dash/fret ("E|--0"). This avoids
  // catching form diagrams like "A | A | A' | B", which use spaces around the bar.
  if (/^[eEADGB]\|[-\dxX]/.test(line)) return "tab";
  if (/^count\b/i.test(line)) return "count";

  const tokens = line.split(/[\s|]+/).filter(Boolean);
  if (tokens.length && tokens.every((token) => /^[A-Ga-g](#|b)?$/.test(token))) return "notes";

  const core = tokens.filter((token) => !WORD_LABEL.test(token));
  if (core.length && core.every((token) => ROMAN.test(token))) return "chords";
  if (core.length && core.every((token) => token === "?" || /^(b|#)?\d(-(b|#)?\d)*$/.test(token))) return "degrees";

  return "guide";
}

export function labelLines(tab: readonly string[]): LabeledLine[] {
  return tab.map((text) => ({ text, type: classifyLine(text) }));
}

export const NOTATION_LABEL: Record<NotationType, string> = {
  tab: "Tab", count: "Count", accents: "Accents", degrees: "Degrees",
  chords: "Chords", notes: "Notes", guide: ""
};

const LEGEND_TEXT: Partial<Record<NotationType, string>> = {
  tab: "Tab — each lettered row is a guitar string (low to high: E A D G B e). A number is the fret to press; 0 = play open, and the dashes are just spacing that shows timing. x = muted string, | = bar line.",
  count: "Count — shows where the beats fall. “1 + 2 +” marks each beat and the “and” between beats.",
  accents: "Accents (>) — play those beats a little harder than the rest.",
  degrees: "Degrees — numbers are scale steps counted from the home note: 1 = tonic (home), up to 7. b3 means a flattened third.",
  chords: "Chords — Roman numerals name chords in the key: uppercase = major (I, IV, V), lowercase = minor (ii, vi). A 7 adds a seventh.",
  notes: "Notes — single letters A–G are note names."
};

// Adaptive legend: only the explanations for notations actually shown in this study,
// plus the always-useful reminder that ear tasks work without a guitar.
export function legendFor(lines: readonly LabeledLine[]): string[] {
  const present = new Set(lines.map((line) => line.type));
  const order: NotationType[] = ["tab", "degrees", "chords", "notes", "count", "accents"];
  const entries = order.filter((type) => present.has(type)).map((type) => LEGEND_TEXT[type]!);
  if (!entries.length) entries.push("This study is described in words — follow the guidance and use your ear.");
  entries.push("No guitar to hand? You can still do the listening and singing tasks by ear.");
  return entries;
}
