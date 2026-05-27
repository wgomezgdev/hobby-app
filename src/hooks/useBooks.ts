import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import type { Book } from '../types/entities';

export function useAllBooks(): Book[] | undefined {
  return useLiveQuery(() => db.books.orderBy('createdAt').reverse().toArray());
}

export function useBook(id: number): Book | undefined {
  return useLiveQuery(() => db.books.get(id), [id]);
}
