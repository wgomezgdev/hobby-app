export type BookStatus = 'WANT_TO_READ' | 'READING' | 'FINISHED';

export type Genre = 'Fantasía' | 'Aventura' | 'Ciencia Ficción' | 'Romance' | 'Thriller';

export const GENRES: Genre[] = ['Fantasía', 'Aventura', 'Ciencia Ficción', 'Romance', 'Thriller'];

export interface Book {
  id?: number;
  title: string;
  author: string;
  status: BookStatus;
  cover?: string;
  currentProgress: number;  // 0–100; derived from currentPage/totalPages when available
  year?: number;            // publication year (4-digit)
  totalPages?: number;
  currentPage?: number;
  genres: string[];         // subset of GENRES; empty array by default
  createdAt: number;
  updatedAt: number;
}

export interface ReadingSession {
  id?: number;
  bookId: number;
  startedAt: number;
  durationMinutes: number;
  progressDelta: number;
  notes?: string;
}

export interface Quote {
  id?: number;
  bookId: number;
  text: string;
  pageNumber?: number;
  tags: string[];
  isFavorite: boolean;
  createdAt: number;
}

export interface Rating {
  bookId: number;
  stars: number;
  review?: string;
  ratedAt: number;
}

export interface Snapshot {
  version: 1;
  exportedAt: number;
  books: Book[];
  sessions: ReadingSession[];
  quotes: Quote[];
  ratings: Rating[];
}
