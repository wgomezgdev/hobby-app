import { db } from '../db/db';
import type { Book } from '../types/entities';

export async function getAllBooks(): Promise<Book[]> {
  return db.books.orderBy('createdAt').reverse().toArray();
}

export async function getBook(id: number): Promise<Book | undefined> {
  return db.books.get(id);
}

export async function addBook(
  book: Omit<Book, 'id' | 'createdAt' | 'updatedAt'>
): Promise<number> {
  const now = Date.now();
  const derived = deriveProgress(book);
  return db.books.add({ ...book, ...derived, genres: book.genres ?? [], createdAt: now, updatedAt: now });
}

export async function updateBook(
  id: number,
  changes: Partial<Omit<Book, 'id' | 'createdAt'>>
): Promise<void> {
  const derived = deriveProgress(changes);
  await db.books.update(id, { ...changes, ...derived, updatedAt: Date.now() });
}

export async function deleteBook(id: number): Promise<void> {
  await db.transaction('rw', db.books, db.sessions, db.quotes, db.ratings, async () => {
    await db.sessions.where('bookId').equals(id).delete();
    await db.quotes.where('bookId').equals(id).delete();
    await db.ratings.where('bookId').equals(id).delete();
    await db.books.delete(id);
  });
}

function deriveProgress(
  data: Partial<Pick<Book, 'currentPage' | 'totalPages' | 'currentProgress'>>
): Partial<Pick<Book, 'currentProgress'>> {
  const { currentPage, totalPages } = data;
  if (currentPage !== undefined && totalPages && totalPages > 0) {
    return { currentProgress: Math.min(100, Math.round((currentPage / totalPages) * 100)) };
  }
  return {};
}
