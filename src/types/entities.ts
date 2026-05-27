export type BookStatus = 'WANT_TO_READ' | 'READING' | 'FINISHED';

export interface Book {
  id?: number;
  title: string;
  author: string;
  status: BookStatus;
  cover?: string;
  currentProgress: number;
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
