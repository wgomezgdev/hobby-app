import type { Book, ReadingSession } from '../types/entities';

export interface PaceStats {
  startDate: Date | null;
  daysReading: number;
  avgPacePerDay: number;
  daysToFinish: number | null;
}

export function calcPaceStats(sessions: ReadingSession[], book: Book): PaceStats {
  if (sessions.length === 0) {
    return { startDate: null, daysReading: 0, avgPacePerDay: 0, daysToFinish: null };
  }

  const startDate = new Date(Math.min(...sessions.map(s => s.startedAt)));

  const uniqueDays = new Set(
    sessions.map(s => {
      const d = new Date(s.startedAt);
      return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    })
  );
  const daysReading = uniqueDays.size;

  const daysSinceStart = Math.max(1, Math.ceil((Date.now() - startDate.getTime()) / 86_400_000));
  const currentPage = book.currentPage ?? 0;
  const avgPacePerDay = currentPage > 0 ? Math.round(currentPage / daysSinceStart) : 0;

  let daysToFinish: number | null = null;
  if (book.totalPages && currentPage < book.totalPages && avgPacePerDay > 0) {
    daysToFinish = Math.ceil((book.totalPages - currentPage) / avgPacePerDay);
  }

  return { startDate, daysReading, avgPacePerDay, daysToFinish };
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
}
