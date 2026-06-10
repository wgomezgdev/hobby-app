import {
  collection, doc, writeBatch, getDocs,
} from 'firebase/firestore';
import { firestoreDb } from './firebase';
import { db } from '../db/db';
import type { Book, ReadingSession, Quote, Rating } from '../types/entities';

const BATCH_CHUNK = 400;

function userCol(uid: string, table: string) {
  return collection(firestoreDb!, 'users', uid, table);
}

function chunkArray<T>(arr: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) result.push(arr.slice(i, i + size));
  return result;
}

function stripUndefined<T extends object>(obj: T): T {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined)
  ) as T;
}

async function batchWrite(uid: string, table: string, items: { id: string; data: object }[]) {
  for (const chunk of chunkArray(items, BATCH_CHUNK)) {
    const batch = writeBatch(firestoreDb!);
    chunk.forEach(({ id, data }) =>
      batch.set(doc(userCol(uid, table), id), stripUndefined(data))
    );
    await batch.commit();
  }
}

export async function pushToFirestore(uid: string): Promise<void> {
  const [books, sessions, quotes, ratings] = await Promise.all([
    db.books.toArray(),
    db.sessions.toArray(),
    db.quotes.toArray(),
    db.ratings.toArray(),
  ]);

  await Promise.all([
    batchWrite(uid, 'books', books.map(b => ({ id: String(b.id), data: b }))),
    batchWrite(uid, 'sessions', sessions.map(s => ({ id: String(s.id), data: s }))),
    batchWrite(uid, 'quotes', quotes.map(q => ({ id: String(q.id), data: q }))),
    batchWrite(uid, 'ratings', ratings.map(r => ({ id: String(r.bookId), data: r }))),
  ]);

  localStorage.setItem('lastSyncedAt', new Date().toISOString());
}

export async function pullFromFirestore(uid: string): Promise<void> {
  const [booksSnap, sessionsSnap, quotesSnap, ratingsSnap] = await Promise.all([
    getDocs(userCol(uid, 'books')),
    getDocs(userCol(uid, 'sessions')),
    getDocs(userCol(uid, 'quotes')),
    getDocs(userCol(uid, 'ratings')),
  ]);

  const books = booksSnap.docs.map(d => d.data() as Book);
  const sessions = sessionsSnap.docs.map(d => d.data() as ReadingSession);
  const quotes = quotesSnap.docs.map(d => d.data() as Quote);
  const ratings = ratingsSnap.docs.map(d => d.data() as Rating);

  await db.transaction('rw', db.books, db.sessions, db.quotes, db.ratings, async () => {
    await db.books.clear();
    await db.sessions.clear();
    await db.quotes.clear();
    await db.ratings.clear();
    if (books.length) await db.books.bulkPut(books);
    if (sessions.length) await db.sessions.bulkPut(sessions);
    if (quotes.length) await db.quotes.bulkPut(quotes);
    if (ratings.length) await db.ratings.bulkPut(ratings);
  });

  localStorage.setItem('lastSyncedAt', new Date().toISOString());
}

export async function autoSyncOnSignIn(uid: string): Promise<void> {
  const [localCount, remoteSnap] = await Promise.all([
    db.books.count(),
    getDocs(userCol(uid, 'books')),
  ]);

  if (localCount > 0) {
    await pushToFirestore(uid);
  } else if (!remoteSnap.empty) {
    await pullFromFirestore(uid);
  }
}

export function getLastSyncedAt(): Date | null {
  const raw = localStorage.getItem('lastSyncedAt');
  return raw ? new Date(raw) : null;
}
