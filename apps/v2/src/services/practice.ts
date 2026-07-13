export type PracticeRating = "again" | "hard" | "easy";

interface PracticeRecord {
  dueAt: number;
  intervalDays: number;
  attempts: number;
}

type PracticeRecords = Record<string, PracticeRecord>;

const STORAGE_KEY = "guitar-academy-v2-practice";

function loadRecords(): PracticeRecords {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}") as PracticeRecords;
  } catch {
    return {};
  }
}

export function orderPracticeIds(ids: readonly string[]): string[] {
  const records = loadRecords();
  const now = Date.now();
  return [...ids].sort((left, right) => {
    const leftDue = records[left]?.dueAt ?? 0;
    const rightDue = records[right]?.dueAt ?? 0;
    const leftOverdue = leftDue <= now ? 0 : 1;
    const rightOverdue = rightDue <= now ? 0 : 1;
    return leftOverdue - rightOverdue || leftDue - rightDue;
  });
}

export function recordPracticeResult(id: string, rating: PracticeRating): void {
  const records = loadRecords();
  const previous = records[id] ?? {
    dueAt: 0,
    intervalDays: 0,
    attempts: 0
  };
  const intervalDays =
    rating === "again"
      ? 0
      : rating === "hard"
        ? Math.max(1, Math.round(previous.intervalDays * 1.5))
        : Math.max(3, Math.round(previous.intervalDays * 2.5));
  records[id] = {
    dueAt:
      rating === "again"
        ? Date.now() + 5 * 60 * 1000
        : Date.now() + intervalDays * 24 * 60 * 60 * 1000,
    intervalDays,
    attempts: previous.attempts + 1
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}
