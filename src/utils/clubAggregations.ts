import { collection, getCountFromServer, getDocs, orderBy, query } from 'firebase/firestore';
import { firestoreDb } from '../lib/firebase';
import type { ClubPost, ReactionEmoji } from '../types/clubs';

export async function getTotalPostCount(clubId: string): Promise<number> {
  if (!firestoreDb) return 0;
  const snap = await getCountFromServer(collection(firestoreDb, 'clubs', clubId, 'posts'));
  return snap.data().count;
}

export async function getTotalReactionCount(clubId: string): Promise<number> {
  if (!firestoreDb) return 0;
  const snap = await getDocs(collection(firestoreDb, 'clubs', clubId, 'posts'));
  let total = 0;
  snap.forEach(d => {
    const rc = (d.data() as ClubPost).reactionCounts ?? {};
    total += Object.values(rc).reduce((s: number, v) => s + (v as number), 0);
  });
  return total;
}

export async function getTopPostsSample(clubId: string, n = 5): Promise<string> {
  if (!firestoreDb) return '';
  const snap = await getDocs(
    query(collection(firestoreDb, 'clubs', clubId, 'posts'), orderBy('createdAt', 'desc'))
  );
  const posts: ClubPost[] = snap.docs.map(d => d.data() as ClubPost);
  const emojiKeys: ReactionEmoji[] = ['fire', 'laugh', 'cry', 'mindblown'];
  const sorted = posts.sort((a, b) => {
    const sumA = emojiKeys.reduce((s, k) => s + (a.reactionCounts?.[k] ?? 0), 0);
    const sumB = emojiKeys.reduce((s, k) => s + (b.reactionCounts?.[k] ?? 0), 0);
    return sumB - sumA;
  });
  return sorted.slice(0, n).map(p => `- ${p.text}`).join('\n');
}
