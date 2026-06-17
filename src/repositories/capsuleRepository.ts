import { collection, doc, getDoc, getDocs, setDoc, updateDoc } from 'firebase/firestore';
import { firestoreDb } from '../lib/firebase';
import type { Club, ClubCapsule, CapsuleMemberSnapshot } from '../types/clubs';
import { closeClub } from './clubRepository';
import { getTotalPostCount, getTotalReactionCount, getTopPostsSample } from '../utils/clubAggregations';
import { generateCapsuleSummary } from '../utils/geminiClubs';

function db() {
  if (!firestoreDb) throw new Error('Firestore not configured.');
  return firestoreDb;
}

export async function saveCapsule(capsule: ClubCapsule): Promise<void> {
  await setDoc(doc(db(), 'capsules', capsule.clubId), capsule);
  await updateDoc(doc(db(), 'clubs', capsule.clubId), { capsuleId: capsule.clubId });
}

export async function getCapsule(clubId: string): Promise<ClubCapsule | null> {
  const snap = await getDoc(doc(db(), 'capsules', clubId));
  return snap.exists() ? (snap.data() as ClubCapsule) : null;
}

export async function closeClubAndGenerateCapsule(
  clubId: string,
  _currentUser: { uid: string; displayName: string }
): Promise<void> {
  await closeClub(clubId);

  const clubSnap = await getDoc(doc(db(), 'clubs', clubId));
  const club = clubSnap.data() as Club;

  const membersSnap = await getDocs(collection(db(), 'clubs', clubId, 'members'));
  const memberSnapshots: CapsuleMemberSnapshot[] = membersSnap.docs.map(d => {
    const m = d.data();
    return {
      uid: m.uid,
      displayName: m.displayName,
      photoURL: m.photoURL ?? null,
      finalProgress: m.progress ?? 0,
      badges: m.badges ?? [],
    };
  });

  const [totalPosts, totalReactions, topPostsSample] = await Promise.all([
    getTotalPostCount(clubId),
    getTotalReactionCount(clubId),
    getTopPostsSample(clubId, 5),
  ]);

  let generatedSummary = 'Summary could not be generated. The club memories are preserved above.';
  try {
    generatedSummary = await generateCapsuleSummary({
      clubName: club.name,
      bookTitle: club.bookTitle,
      bookAuthor: club.bookAuthor,
      memberCount: club.memberCount,
      totalPosts,
      totalReactions,
      topPostsSample,
      language: 'English',
    });
  } catch (e) {
    console.error('Capsule summary generation failed:', e);
  }

  const capsule: ClubCapsule = {
    id: clubId,
    clubId,
    clubName: club.name,
    bookTitle: club.bookTitle,
    bookAuthor: club.bookAuthor,
    closedAt: club.closedAt ?? Date.now(),
    memberCount: club.memberCount,
    totalPosts,
    totalReactions,
    generatedSummary,
    summaryGeneratedAt: Date.now(),
    memberSnapshots,
  };

  await saveCapsule(capsule);
}
