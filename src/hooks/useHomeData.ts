import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';

export function useHomeData() {
  return useLiveQuery(async () => {
    const books = await db.books.toArray();
    const readingBooks = books
      .filter(b => b.status === 'READING')
      .sort((a, b) => b.updatedAt - a.updatedAt);
    const finishedBooks = books
      .filter(b => b.status === 'FINISHED')
      .sort((a, b) => b.updatedAt - a.updatedAt);
    const readingCount = readingBooks.length;
    const finishedCount = finishedBooks.length;
    const pendingCount = books.filter(b => b.status === 'WANT_TO_READ').length;
    return { readingCount, finishedCount, pendingCount, readingBooks, finishedBooks };
  });
}
