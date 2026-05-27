import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import type { Rating } from '../types/entities';

export function useRating(bookId: number): Rating | undefined {
  return useLiveQuery(() => db.ratings.get(bookId), [bookId]);
}

export function useAllRatings(): Rating[] | undefined {
  return useLiveQuery(() => db.ratings.toArray());
}
