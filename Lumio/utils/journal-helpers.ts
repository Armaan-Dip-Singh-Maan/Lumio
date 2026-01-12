import { JournalEntry } from './journal-storage';

export interface GroupedEntry {
  date: string; // YYYY-MM-DD
  entries: JournalEntry[];
}

/**
 * Group journal entries by local date (YYYY-MM-DD)
 * Returns array sorted by date descending (newest first)
 */
export function groupEntriesByLocalDate(entries: JournalEntry[]): GroupedEntry[] {
  const grouped = new Map<string, JournalEntry[]>();
  
  entries.forEach((entry) => {
    const date = entry.date; // Already in YYYY-MM-DD format
    if (!grouped.has(date)) {
      grouped.set(date, []);
    }
    grouped.get(date)!.push(entry);
  });
  
  // Convert to array and sort by date descending
  const result: GroupedEntry[] = Array.from(grouped.entries()).map(([date, entries]) => ({
    date,
    entries: entries.sort((a, b) => b.createdAt - a.createdAt), // Sort entries within date by time descending
  }));
  
  // Sort by date descending (newest first)
  result.sort((a, b) => b.date.localeCompare(a.date));
  
  return result;
}

/**
 * Get set of dates that have entries (YYYY-MM-DD format)
 */
export function getMarkedDates(entries: JournalEntry[]): Set<string> {
  return new Set(entries.map((entry) => entry.date));
}

/**
 * Format date as "Mon, Jan 11"
 */
export function formatDayHeader(dateString: string): string {
  const date = new Date(dateString + 'T00:00:00');
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const dayName = days[date.getDay()];
  const monthName = months[date.getMonth()];
  const day = date.getDate();
  
  return `${dayName}, ${monthName} ${day}`;
}

/**
 * Format time as "10:41 PM"
 */
export function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  const displayMinutes = minutes.toString().padStart(2, '0');
  
  return `${displayHours}:${displayMinutes} ${ampm}`;
}

/**
 * Get preview snippet (1-3 lines, max ~120 characters)
 */
export function getPreviewSnippet(content: string, maxLength: number = 120): string {
  const trimmed = content.trim();
  if (trimmed.length <= maxLength) {
    return trimmed;
  }
  
  // Try to break at a sentence
  const truncated = trimmed.substring(0, maxLength);
  const lastPeriod = truncated.lastIndexOf('.');
  const lastNewline = truncated.lastIndexOf('\n');
  const breakPoint = Math.max(lastPeriod, lastNewline);
  
  if (breakPoint > maxLength * 0.6) {
    return trimmed.substring(0, breakPoint + 1);
  }
  
  return truncated + '...';
}

