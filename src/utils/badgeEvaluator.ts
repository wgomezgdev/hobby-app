import {
  collection, doc, getDocs, getDoc, query, runTransaction, where,
} from 'firebase/firestore';
import { firestoreDb } from '../lib/firebase';
import type { BadgeId, PostType } from '../types/clubs';

export async function evaluateBadgesAfterPost(
  clubId: string,
  uid: string,
  postType: PostType
): Promise<void> {
  if (!firestoreDb) return;
  const memberRef = doc(firestoreDb, 'clubs', clubId, 'members', uid);

  await runTransaction(firestoreDb, async (tx) => {
    const snap = await tx.get(memberRef);
    if (!snap.exists()) return;

    const data = snap.data();
    const updates: Record<string, unknown> = {};
    const badges: BadgeId[] = [...(data.badges ?? [])];

    const todayMidnight = new Date().setUTCHours(0, 0, 0, 0);
    const activeDays: number[] = [...(data.activeDays ?? [])];
    if (!activeDays.includes(todayMidnight)) {
      activeDays.push(todayMidnight);
      updates.activeDays = activeDays;
      if (activeDays.length >= 7 && !badges.includes('LOYAL_READER')) {
        badges.push('LOYAL_READER');
      }
    }

    if (postType === 'QUOTE') {
      const newCount = (data.quotePostCount ?? 0) + 1;
      updates.quotePostCount = newCount;
      if (newCount >= 5 && !badges.includes('QUOTE_MASTER')) {
        badges.push('QUOTE_MASTER');
      }
    }

    if (postType === 'DISCOVERY') {
      const newCount = (data.discoveryPostCount ?? 0) + 1;
      updates.discoveryPostCount = newCount;
      if (newCount >= 3 && !badges.includes('THE_ANALYST')) {
        badges.push('THE_ANALYST');
      }
    }

    updates.badges = badges;
    tx.update(memberRef, updates);
  });
}

export async function evaluateBadgesAfterProgress(
  clubId: string,
  uid: string,
  newProgress: number
): Promise<BadgeId[]> {
  if (!firestoreDb || newProgress < 100) return [];

  const memberRef = doc(firestoreDb, 'clubs', clubId, 'members', uid);
  const memberSnap = await getDoc(memberRef);
  if (!memberSnap.exists()) return [];

  const currentBadges: BadgeId[] = memberSnap.data().badges ?? [];
  if (currentBadges.includes('FIRST_TO_FINISH')) return [];

  const membersSnap = await getDocs(
    query(collection(firestoreDb, 'clubs', clubId, 'members'), where('progress', '==', 100))
  );

  if (membersSnap.size <= 1) {
    const newBadges: BadgeId[] = [...currentBadges, 'FIRST_TO_FINISH'];
    await runTransaction(firestoreDb, async (tx) => {
      tx.update(memberRef, { badges: newBadges });
    });
    return ['FIRST_TO_FINISH'];
  }
  return [];
}
