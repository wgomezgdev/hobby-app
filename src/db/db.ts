import Dexie, { type Table } from 'dexie';
import type { Book, ReadingSession, Quote, Rating } from '../types/entities';

export class ReadingPalDB extends Dexie {
  books!: Table<Book>;
  sessions!: Table<ReadingSession>;
  quotes!: Table<Quote>;
  ratings!: Table<Rating>;

  constructor() {
    super('ReadingPalDB');
    this.version(1).stores({
      books: '++id, status, title, author, createdAt',
      sessions: '++id, bookId, startedAt',
      quotes: '++id, bookId, isFavorite, *tags',
      ratings: 'bookId',
    });
    // v2: adds *genres multi-entry index; year/totalPages/currentPage are plain fields
    this.version(2).stores({
      books: '++id, status, title, author, createdAt, *genres',
    });
  }
}

export const db = new ReadingPalDB();
