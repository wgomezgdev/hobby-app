import type { Book } from '../types/entities';

const MONTH_SHORT = ['E', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
const MONTH_FULL = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

function finishedInYear(books: Book[], year: number | 'all'): Book[] {
  return books.filter(b => {
    if (b.status !== 'FINISHED') return false;
    if (year === 'all') return true;
    return new Date(b.updatedAt).getFullYear() === year;
  });
}

export function getBooksReadByYear(books: Book[], year: number | 'all'): number {
  return finishedInYear(books, year).length;
}

export function getBooksByMonth(books: Book[], year: number | 'all'): { month: string; count: number }[] {
  const counts = Array(12).fill(0) as number[];
  finishedInYear(books, year).forEach(b => {
    counts[new Date(b.updatedAt).getMonth()]++;
  });
  return MONTH_SHORT.map((month, i) => ({ month, count: counts[i] }));
}

export function getAvgPerMonth(books: Book[], year: number | 'all'): number {
  const monthly = getBooksByMonth(books, year);
  const active = monthly.filter(m => m.count > 0);
  if (active.length === 0) return 0;
  return Math.round((active.reduce((s, m) => s + m.count, 0) / active.length) * 10) / 10;
}

export function getGenreBreakdown(books: Book[]): { genre: string; count: number; pct: number }[] {
  const map: Record<string, number> = {};
  books.forEach(b => (b.genres ?? []).forEach(g => { map[g] = (map[g] ?? 0) + 1; }));
  const total = Object.values(map).reduce((a, b) => a + b, 0);
  if (total === 0) return [];
  return Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .map(([genre, count]) => ({ genre, count, pct: Math.round((count / total) * 100) }));
}

export function getTotalPagesRead(books: Book[], year: number | 'all'): number {
  return finishedInYear(books, year)
    .filter(b => b.totalPages)
    .reduce((sum, b) => sum + (b.totalPages ?? 0), 0);
}

export function getBestMonth(books: Book[], year: number | 'all'): { month: string; count: number } | null {
  const monthly = getBooksByMonth(books, year);
  const best = monthly.reduce((a, b) => (b.count > a.count ? b : a), { month: '', count: 0 });
  if (best.count === 0) return null;
  const idx = MONTH_SHORT.indexOf(best.month);
  return { month: MONTH_FULL[idx] ?? best.month, count: best.count };
}

export function getYoyChange(books: Book[], year: number): number | null {
  const cur = getBooksReadByYear(books, year);
  const prev = getBooksReadByYear(books, year - 1);
  if (prev === 0) return null;
  return Math.round(((cur - prev) / prev) * 100);
}

export function getAvailableYears(books: Book[]): number[] {
  const years = new Set(
    books.filter(b => b.status === 'FINISHED').map(b => new Date(b.updatedAt).getFullYear())
  );
  return Array.from(years).sort((a, b) => b - a);
}
