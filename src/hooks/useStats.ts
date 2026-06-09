import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { useStatsUiStore } from '../stores/statsUiStore';
import {
  finishedInYear,
  getBooksReadByYear, getBooksByMonth, getAvgPerMonth,
  getGenreBreakdown, getTotalPagesRead, getBestMonth,
  getYoyChange, getAvailableYears,
  getTotalReadingMinutes, getTotalSessions, getReadingStreak,
} from '../utils/statsAggregations';

export function useStats() {
  const { selectedYear } = useStatsUiStore();
  const books = useLiveQuery(() => db.books.toArray(), []);
  const sessions = useLiveQuery(() => db.sessions.toArray(), []);

  if (!books || !sessions) return null;

  return {
    booksRead: getBooksReadByYear(books, selectedYear),
    booksByMonth: getBooksByMonth(books, selectedYear),
    avgPerMonth: getAvgPerMonth(books, selectedYear),
    genreBreakdown: getGenreBreakdown(finishedInYear(books, selectedYear)),
    totalPages: getTotalPagesRead(books, selectedYear),
    bestMonth: getBestMonth(books, selectedYear),
    yoyChange: typeof selectedYear === 'number' ? getYoyChange(books, selectedYear) : null,
    availableYears: getAvailableYears(books),
    totalReadingMinutes: getTotalReadingMinutes(sessions, selectedYear),
    totalSessions: getTotalSessions(sessions, selectedYear),
    readingStreak: getReadingStreak(sessions),
  };
}
