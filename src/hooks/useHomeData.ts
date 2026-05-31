import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';

export function useHomeData() {
  return useLiveQuery(async () => {
    const books = await db.books.toArray();
    const readingCount = books.filter(b => b.status === 'READING').length;
    const finishedCount = books.filter(b => b.status === 'FINISHED').length;
    const pendingCount = books.filter(b => b.status === 'WANT_TO_READ').length;
    const currentBook = books.find(b => b.status === 'READING');
    const recentlyFinished = books
      .filter(b => b.status === 'FINISHED')
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .slice(0, 8);
    return { readingCount, finishedCount, pendingCount, currentBook, recentlyFinished };
  });
}
