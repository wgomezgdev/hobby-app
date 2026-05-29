import { db } from '../db/db';
import type { Snapshot } from '../types/entities';

export async function exportSnapshot(): Promise<void> {
  const [books, sessions, quotes, ratings] = await Promise.all([
    db.books.toArray(),
    db.sessions.toArray(),
    db.quotes.toArray(),
    db.ratings.toArray(),
  ]);

  const snapshot: Snapshot = {
    version: 1,
    exportedAt: Date.now(),
    books,
    sessions,
    quotes,
    ratings,
  };

  const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `my-hobbies-backup-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function importSnapshot(file: File): Promise<void> {
  const text = await file.text();
  let snapshot: unknown;

  try {
    snapshot = JSON.parse(text);
  } catch {
    throw new Error('Invalid file: could not parse JSON.');
  }

  if (
    typeof snapshot !== 'object' ||
    snapshot === null ||
    (snapshot as Snapshot).version !== 1 ||
    !Array.isArray((snapshot as Snapshot).books)
  ) {
    throw new Error('Invalid file: not a My Hobbies backup.');
  }

  const data = snapshot as Snapshot;

  await db.transaction('rw', db.books, db.sessions, db.quotes, db.ratings, async () => {
    await db.books.clear();
    await db.sessions.clear();
    await db.quotes.clear();
    await db.ratings.clear();
    await db.books.bulkAdd(data.books);
    await db.sessions.bulkAdd(data.sessions);
    await db.quotes.bulkAdd(data.quotes);
    await db.ratings.bulkAdd(data.ratings);
  });
}
