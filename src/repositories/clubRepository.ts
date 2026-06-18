import {
  collection, doc, getDoc, getDocs, increment, query,
  runTransaction, setDoc, updateDoc, where, orderBy,
} from 'firebase/firestore';
import { firestoreDb } from '../lib/firebase';
import type { Club, ClubMember } from '../types/clubs';
import { generateInviteCode, normalizeCode } from '../utils/inviteCode';

export class AlreadyMemberError extends Error {
  constructor() { super('Already a member of this club.'); this.name = 'AlreadyMemberError'; }
}

export class ClubClosedError extends Error {
  constructor() { super('This club is no longer accepting members.'); this.name = 'ClubClosedError'; }
}

function db() {
  if (!firestoreDb) throw new Error('Firestore not configured.');
  return firestoreDb;
}

async function ensureUniqueCode(maxRetries = 5): Promise<string> {
  for (let i = 0; i < maxRetries; i++) {
    const code = generateInviteCode();
    const snap = await getDocs(query(collection(db(), 'clubs'), where('inviteCode', '==', code)));
    if (snap.empty) return code;
  }
  throw new Error('Could not generate a unique invite code. Please try again.');
}

export async function createClub(
  data: Omit<Club, 'id' | 'createdAt' | 'memberCount' | 'status' | 'inviteCode'>,
  moderator: { uid: string; displayName: string; photoURL: string | null }
): Promise<string> {
  const inviteCode = await ensureUniqueCode();
  const now = Date.now();

  const clubRef = doc(collection(db(), 'clubs'));
  const clubId = clubRef.id;

  const club: Club = {
    id: clubId,
    ...data,
    inviteCode,
    status: 'ACTIVE',
    memberCount: 1,
    createdAt: now,
  };

  const memberDoc: ClubMember = {
    uid: moderator.uid,
    displayName: moderator.displayName,
    photoURL: moderator.photoURL,
    role: 'MODERATOR',
    joinedAt: now,
    progress: 0,
    badges: [],
    quotePostCount: 0,
    discoveryPostCount: 0,
    activeDays: [],
    paceStatus: null,
    milestonesReached: [],
  };

  const memberRef = doc(db(), 'clubs', clubId, 'members', moderator.uid);
  const mirrorRef = doc(db(), 'userClubs', moderator.uid, 'clubs', clubId);

  await setDoc(clubRef, club);
  await setDoc(memberRef, memberDoc);
  await setDoc(mirrorRef, {
    clubId,
    clubName: data.name,
    bookTitle: data.bookTitle,
    joinedAt: now,
    role: 'MODERATOR',
  });

  return clubId;
}

export async function getClubByInviteCode(code: string): Promise<Club | null> {
  const normalized = normalizeCode(code);
  const snap = await getDocs(query(collection(db(), 'clubs'), where('inviteCode', '==', normalized)));
  if (snap.empty) return null;
  return snap.docs[0].data() as Club;
}

export async function joinClub(
  clubId: string,
  member: { uid: string; displayName: string; photoURL: string | null }
): Promise<void> {
  const memberRef = doc(db(), 'clubs', clubId, 'members', member.uid);
  const existing = await getDoc(memberRef);
  if (existing.exists()) throw new AlreadyMemberError();

  const clubRef = doc(db(), 'clubs', clubId);
  const clubSnap = await getDoc(clubRef);
  if (!clubSnap.exists()) throw new Error('Club not found.');
  const club = clubSnap.data() as Club;
  if (club.status === 'CLOSED') throw new ClubClosedError();

  const now = Date.now();
  const memberDoc: ClubMember = {
    uid: member.uid,
    displayName: member.displayName,
    photoURL: member.photoURL,
    role: 'MEMBER',
    joinedAt: now,
    progress: 0,
    badges: [],
    quotePostCount: 0,
    discoveryPostCount: 0,
    activeDays: [],
    paceStatus: null,
    milestonesReached: [],
  };

  await runTransaction(db(), async (tx) => {
    tx.set(memberRef, memberDoc);
    tx.update(clubRef, { memberCount: increment(1) });
  });

  const mirrorRef = doc(db(), 'userClubs', member.uid, 'clubs', clubId);
  await setDoc(mirrorRef, {
    clubId,
    clubName: club.name,
    bookTitle: club.bookTitle,
    joinedAt: now,
    role: 'MEMBER',
  });
}

export async function closeClub(clubId: string): Promise<void> {
  await updateDoc(doc(db(), 'clubs', clubId), {
    status: 'CLOSED',
    closedAt: Date.now(),
  });
}

export async function getUserClubs(uid: string): Promise<Club[]> {
  const mirrorSnap = await getDocs(
    query(collection(db(), 'userClubs', uid, 'clubs'), orderBy('joinedAt', 'desc'))
  );
  const clubs: Club[] = [];
  for (const mirrorDoc of mirrorSnap.docs) {
    const { clubId } = mirrorDoc.data();
    const clubSnap = await getDoc(doc(db(), 'clubs', clubId));
    if (clubSnap.exists()) clubs.push(clubSnap.data() as Club);
  }
  return clubs;
}
