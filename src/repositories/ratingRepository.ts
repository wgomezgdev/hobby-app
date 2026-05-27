import { db } from '../db/db';
import type { Rating } from '../types/entities';

export async function getRating(bookId: number): Promise<Rating | undefined> {
  return db.ratings.get(bookId);
}

export async function saveRating(rating: Rating): Promise<void> {
  await db.ratings.put(rating);
}
