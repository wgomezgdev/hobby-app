import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import type { ReadingSession } from '../types/entities';

export function useSessionsForBook(bookId: number): ReadingSession[] | undefined {
  return useLiveQuery(
    () => db.sessions.where('bookId').equals(bookId).sortBy('startedAt'),
    [bookId]
  );
}
