import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { useStatsUiStore } from '../stores/statsUiStore';
import {
  getBooksReadByYear, getBooksByMonth, getAvgPerMonth,
  getGenreBreakdown, getTotalPagesRead, getBestMonth,
  getYoyChange, getAvailableYears,
} from '../utils/statsAggregations';

export function useStats() {
  const { selectedYear } = useStatsUiStore();
  const books = useLiveQuery(() => db.books.toArray(), []);

  if (!books) return null;

  return {
    booksRead: getBooksReadByYear(books, selectedYear),
    booksByMonth: getBooksByMonth(books, selectedYear),
    avgPerMonth: getAvgPerMonth(books, selectedYear),
    genreBreakdown: getGenreBreakdown(books.filter(b => b.status === 'FINISHED')),
    totalPages: getTotalPagesRead(books, selectedYear),
    bestMonth: getBestMonth(books, selectedYear),
    yoyChange: typeof selectedYear === 'number' ? getYoyChange(books, selectedYear) : null,
    availableYears: getAvailableYears(books),
  };
}
