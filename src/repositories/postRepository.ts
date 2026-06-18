import {
  collection, deleteDoc, doc, getDoc, getDocs,
  runTransaction, setDoc, updateDoc, increment,
} from 'firebase/firestore';
import { firestoreDb } from '../lib/firebase';
import type { ClubPost, PostReaction, ReactionEmoji } from '../types/clubs';
import { evaluateBadgesAfterPost } from '../utils/badgeEvaluator';

function db() {
  if (!firestoreDb) throw new Error('Firestore not configured.');
  return firestoreDb;
}

export async function addPost(
  clubId: string,
  post: Omit<ClubPost, 'id' | 'createdAt' | 'reactionCounts'>
): Promise<string> {
  const postRef = doc(collection(db(), 'clubs', clubId, 'posts'));
  const now = Date.now();

  const postDoc: ClubPost = {
    ...post,
    id: postRef.id,
    clubId,
    isPinned: post.isPinned ?? false,
    createdAt: now,
    reactionCounts: { fire: 0, laugh: 0, cry: 0, mindblown: 0 },
  };

  await setDoc(postRef, postDoc);

  evaluateBadgesAfterPost(clubId, post.authorUid, post.type).catch(console.error);

  return postRef.id;
}

export async function deletePost(clubId: string, postId: string): Promise<void> {
  const reactionsRef = collection(db(), 'clubs', clubId, 'posts', postId, 'reactions');
  const reactionsSnap = await getDocs(reactionsRef);
  await Promise.all(reactionsSnap.docs.map(d => deleteDoc(d.ref)));
  await deleteDoc(doc(db(), 'clubs', clubId, 'posts', postId));
}

export async function toggleReaction(
  clubId: string,
  postId: string,
  uid: string,
  emoji: ReactionEmoji
): Promise<void> {
  const postRef = doc(db(), 'clubs', clubId, 'posts', postId);
  const reactionRef = doc(db(), 'clubs', clubId, 'posts', postId, 'reactions', uid);

  await runTransaction(db(), async (tx) => {
    const reactionSnap = await tx.get(reactionRef);
    if (reactionSnap.exists()) {
      const prev = (reactionSnap.data() as PostReaction).emoji;
      tx.delete(reactionRef);
      tx.update(postRef, { [`reactionCounts.${prev}`]: increment(-1) });
    } else {
      const reaction: PostReaction = { uid, emoji, reactedAt: Date.now() };
      tx.set(reactionRef, reaction);
      tx.update(postRef, { [`reactionCounts.${emoji}`]: increment(1) });
    }
  });
}

export async function getUserReaction(
  clubId: string,
  postId: string,
  uid: string
): Promise<ReactionEmoji | null> {
  const reactionRef = doc(db(), 'clubs', clubId, 'posts', postId, 'reactions', uid);
  const snap = await getDoc(reactionRef);
  if (!snap.exists()) return null;
  return (snap.data() as PostReaction).emoji;
}

export async function pinPost(clubId: string, postId: string, pinnedPosts: string[]): Promise<void> {
  if (pinnedPosts.length >= 2) {
    await updateDoc(doc(db(), 'clubs', clubId, 'posts', pinnedPosts[0]), { isPinned: false });
  }
  await updateDoc(doc(db(), 'clubs', clubId, 'posts', postId), { isPinned: true });
}

export async function unpinPost(clubId: string, postId: string): Promise<void> {
  await updateDoc(doc(db(), 'clubs', clubId, 'posts', postId), { isPinned: false });
}
