import { doc, getDoc, setDoc } from 'firebase/firestore';
import { firestoreDb } from './firebase';
import type { TitleSuggestion } from '../hooks/useTitleSuggestions';

const COLLECTION = 'books-cache';
const TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

function cacheKey(query: string): string {
  return encodeURIComponent(query.toLowerCase().trim()).slice(0, 500);
}

interface CacheDoc {
  query: string;
  fetchedAt: number;
  results: TitleSuggestion[];
}

export async function getCached(query: string): Promise<TitleSuggestion[] | null> {
  if (!firestoreDb) return null;
  try {
    const ref = doc(firestoreDb, COLLECTION, cacheKey(query));
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    const data = snap.data() as CacheDoc;
    if (Date.now() - data.fetchedAt > TTL_MS) return null;
    return data.results;
  } catch {
    return null;
  }
}

export function setCached(query: string, results: TitleSuggestion[]): void {
  if (!firestoreDb) return;
  const ref = doc(firestoreDb, COLLECTION, cacheKey(query));
  const payload: CacheDoc = { query: query.toLowerCase().trim(), fetchedAt: Date.now(), results };
  void setDoc(ref, payload).catch(() => {});
}
