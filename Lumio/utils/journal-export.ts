import { Share } from 'react-native';
import type { JournalEntry } from '@/utils/journal-storage';
import { formatDayHeader, formatTime } from '@/utils/journal-helpers';

export function buildJournalMarkdownExport(entries: JournalEntry[]): string {
  const sorted = [...entries].sort((a, b) => b.createdAt - a.createdAt);
  const lines = ['# Lumio journal export', ''];
  sorted.forEach((e) => {
    lines.push(`## ${formatDayHeader(e.date)} · ${formatTime(e.createdAt)}`);
    lines.push('');
    lines.push(e.content.trim());
    lines.push('');
  });
  return lines.join('\n');
}

export function buildJournalJsonExport(entries: JournalEntry[]): string {
  return JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      app: 'Lumio',
      entries: [...entries].sort((a, b) => b.createdAt - a.createdAt),
    },
    null,
    2
  );
}

export async function shareJournalMarkdown(entries: JournalEntry[]): Promise<void> {
  const body = buildJournalMarkdownExport(entries);
  await Share.share({
    message: body,
    title: 'Lumio journal',
  });
}

export async function shareJournalJson(entries: JournalEntry[]): Promise<void> {
  const body = buildJournalJsonExport(entries);
  await Share.share({
    message: body,
    title: 'Lumio journal.json',
  });
}
