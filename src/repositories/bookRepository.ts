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
  return db.books.add({ ...book, createdAt: now, updatedAt: now });
}

export async function updateBook(
  id: number,
  changes: Partial<Omit<Book, 'id' | 'createdAt'>>
): Promise<void> {
  await db.books.update(id, { ...changes, updatedAt: Date.now() });
}

export async function deleteBook(id: number): Promise<void> {
  await db.transaction('rw', db.books, db.sessions, db.quotes, db.ratings, async () => {
    await db.sessions.where('bookId').equals(id).delete();
    await db.quotes.where('bookId').equals(id).delete();
    await db.ratings.where('bookId').equals(id).delete();
    await db.books.delete(id);
  });
}
