import type { JournalEntry } from '@/utils/journal-storage';

function localYmd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Consecutive days with at least one entry, counting back from today
 * (if today has no entry, streak starts from the most recent journaling day).
 */
export function computeCurrentStreak(entryDates: Set<string>): number {
  let streak = 0;
  const d = new Date();
  if (!entryDates.has(localYmd(d))) {
    d.setDate(d.getDate() - 1);
  }
  while (entryDates.has(localYmd(d))) {
    streak += 1;
    d.setDate(d.getDate() - 1);
    if (streak > 500) break;
  }
  return streak;
}

export function daysJournaledThisMonth(entryDates: Set<string>): number {
  const now = new Date();
  const y = now.getFullYear();
  const month = now.getMonth();
  let count = 0;
  entryDates.forEach((ymd) => {
    const [yy, mm] = ymd.split('-').map(Number);
    if (yy === y && mm - 1 === month) count += 1;
  });
  return count;
}

export function todayEntryExists(entryDates: Set<string>): boolean {
  return entryDates.has(localYmd(new Date()));
}

export function getJournalStats(entries: JournalEntry[]): {
  streakDays: number;
  daysThisMonth: number;
  hasEntryToday: boolean;
  totalEntries: number;
} {
  const dates = new Set(entries.map((e) => e.date));
  return {
    streakDays: computeCurrentStreak(dates),
    daysThisMonth: daysJournaledThisMonth(dates),
    hasEntryToday: todayEntryExists(dates),
    totalEntries: entries.length,
  };
}
