import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import type { Quote } from '../types/entities';

export function useQuotesForBook(bookId: number): Quote[] | undefined {
  return useLiveQuery(
    () => db.quotes.where('bookId').equals(bookId).toArray(),
    [bookId]
  );
}

export function useTagsForBook(bookId: number): string[] | undefined {
  return useLiveQuery(async () => {
    const quotes = await db.quotes.where('bookId').equals(bookId).toArray();
    const tagSet = new Set<string>();
    quotes.forEach((q) => q.tags.forEach((t) => tagSet.add(t)));
    return Array.from(tagSet).sort();
  }, [bookId]);
}
