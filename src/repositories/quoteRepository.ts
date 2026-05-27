import { db } from '../db/db';
import type { Quote } from '../types/entities';

export async function getQuotesForBook(bookId: number): Promise<Quote[]> {
  return db.quotes.where('bookId').equals(bookId).toArray();
}

export async function getTagsForBook(bookId: number): Promise<string[]> {
  const quotes = await db.quotes.where('bookId').equals(bookId).toArray();
  const tagSet = new Set<string>();
  quotes.forEach((q) => q.tags.forEach((t) => tagSet.add(t)));
  return Array.from(tagSet).sort();
}

export async function addQuote(quote: Omit<Quote, 'id' | 'createdAt'>): Promise<number> {
  return db.quotes.add({ ...quote, createdAt: Date.now() });
}

export async function toggleFavorite(id: number): Promise<void> {
  const quote = await db.quotes.get(id);
  if (!quote) return;
  await db.quotes.update(id, { isFavorite: !quote.isFavorite });
}

export async function deleteQuote(id: number): Promise<void> {
  await db.quotes.delete(id);
}
