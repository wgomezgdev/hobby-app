import { db } from '../db/db';
import type { ReadingSession } from '../types/entities';

export async function getSessionsForBook(bookId: number): Promise<ReadingSession[]> {
  return db.sessions.where('bookId').equals(bookId).sortBy('startedAt');
}

export async function saveSession(session: Omit<ReadingSession, 'id'>): Promise<void> {
  await db.transaction('rw', db.books, db.sessions, async () => {
    const book = await db.books.get(session.bookId);
    if (!book) throw new Error(`Book ${session.bookId} not found`);
    const newProgress = Math.min(100, book.currentProgress + session.progressDelta);
    await db.sessions.add(session);
    await db.books.update(session.bookId, {
      currentProgress: newProgress,
      status: newProgress >= 100 ? 'FINISHED' : book.status,
      updatedAt: Date.now(),
    });
  });
}

export async function deleteSession(id: number): Promise<void> {
  await db.sessions.delete(id);
}
