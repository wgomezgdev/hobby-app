import type { BookStatus } from '../types/entities';

export interface GoodreadsBookRaw {
  title: string;
  author: string;
  isbn: string;
  status: BookStatus;
  totalPages: number | undefined;
  year: number | undefined;
  cover: string | undefined;
  userRating: number | undefined;
  shelves: string[];
}

const STATUS_MAP: Record<string, BookStatus> = {
  'read': 'FINISHED',
  'currently-reading': 'READING',
  'to-read': 'WANT_TO_READ',
};

export function parseGoodreadsCSV(csvText: string): GoodreadsBookRaw[] {
  const lines = splitCSVLines(csvText);
  if (lines.length < 2) return [];

  const headers = parseCSVRow(lines[0]).map(h => h.trim().toLowerCase());

  const idx = (name: string) => headers.indexOf(name);
  const titleIdx = idx('title');
  const authorIdx = idx('author');
  const isbn13Idx = idx('isbn13');
  const isbn10Idx = idx('isbn');
  const ratingIdx = idx('my rating');
  const pagesIdx = idx('number of pages');
  const origYearIdx = idx('original publication year');
  const pubYearIdx = idx('year published');
  const shelfIdx = idx('exclusive shelf');
  const bookshelvesIdx = idx('bookshelves');

  if (titleIdx === -1 || shelfIdx === -1) return [];

  const books: GoodreadsBookRaw[] = [];

  for (let i = 1; i < lines.length; i++) {
    const row = parseCSVRow(lines[i]);
    const title = row[titleIdx]?.trim() ?? '';
    if (!title) continue;

    const shelf = row[shelfIdx]?.trim() ?? '';
    const status: BookStatus = STATUS_MAP[shelf] ?? 'WANT_TO_READ';

    const author = authorIdx !== -1 ? (row[authorIdx]?.trim() ?? '') : '';

    const rawIsbn13 = isbn13Idx !== -1 ? cleanIsbn(row[isbn13Idx]) : '';
    const rawIsbn10 = isbn10Idx !== -1 ? cleanIsbn(row[isbn10Idx]) : '';
    const isbn = rawIsbn13 || rawIsbn10;

    const ratingRaw = ratingIdx !== -1 ? parseInt(row[ratingIdx] ?? '0', 10) : 0;
    const userRating = ratingRaw >= 1 && ratingRaw <= 5 ? ratingRaw : undefined;

    const pagesRaw = pagesIdx !== -1 ? parseInt(row[pagesIdx] ?? '', 10) : NaN;
    const totalPages = !isNaN(pagesRaw) && pagesRaw > 0 ? pagesRaw : undefined;

    const yearRaw = origYearIdx !== -1
      ? parseInt(row[origYearIdx] ?? '', 10)
      : pubYearIdx !== -1 ? parseInt(row[pubYearIdx] ?? '', 10) : NaN;
    const year =
      !isNaN(yearRaw) && yearRaw > 1000 && yearRaw <= new Date().getFullYear() + 1
        ? yearRaw
        : undefined;

    const shelvesRaw = bookshelvesIdx !== -1 ? (row[bookshelvesIdx]?.trim() ?? '') : '';
    const shelves = shelvesRaw ? shelvesRaw.split(',').map(s => s.trim()).filter(Boolean) : [];

    books.push({ title, author, isbn, status, totalPages, year, cover: undefined, userRating, shelves });
  }

  return books;
}

// Goodreads exports ISBNs as ="1234567890" to prevent Excel from mangling them.
function cleanIsbn(raw: string | undefined): string {
  if (!raw) return '';
  return raw.replace(/[^0-9X]/gi, '');
}

function splitCSVLines(text: string): string[] {
  const lines: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"') {
      if (inQuotes && text[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
        current += ch;
      }
    } else if ((ch === '\n' || ch === '\r') && !inQuotes) {
      if (ch === '\r' && text[i + 1] === '\n') i++;
      if (current.trim()) lines.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  if (current.trim()) lines.push(current);
  return lines;
}

function parseCSVRow(line: string): string[] {
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      fields.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  fields.push(current);
  return fields;
}
