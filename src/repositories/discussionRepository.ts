import { collection, deleteDoc, doc, runTransaction, setDoc } from 'firebase/firestore';
import { firestoreDb } from '../lib/firebase';
import type { ClubDiscussionTopic, ClubReply } from '../types/clubs';

function db() {
  if (!firestoreDb) throw new Error('Firestore not configured.');
  return firestoreDb;
}

export async function addTopic(
  clubId: string,
  topic: Omit<ClubDiscussionTopic, 'id' | 'createdAt' | 'replyCount'>
): Promise<string> {
  const topicRef = doc(collection(db(), 'clubs', clubId, 'topics'));
  const topicDoc: ClubDiscussionTopic = {
    ...topic,
    id: topicRef.id,
    createdAt: Date.now(),
    replyCount: 0,
  };
  await setDoc(topicRef, topicDoc);
  return topicRef.id;
}

export async function addReply(
  clubId: string,
  topicId: string,
  reply: Omit<ClubReply, 'id' | 'createdAt'>
): Promise<void> {
  const replyRef = doc(collection(db(), 'clubs', clubId, 'topics', topicId, 'replies'));
  const topicRef = doc(db(), 'clubs', clubId, 'topics', topicId);

  await runTransaction(db(), async (tx) => {
    const topicSnap = await tx.get(topicRef);
    const replyDoc: ClubReply = {
      ...reply,
      id: replyRef.id,
      createdAt: Date.now(),
    };
    tx.set(replyRef, replyDoc);
    tx.update(topicRef, { replyCount: (topicSnap.data()?.replyCount ?? 0) + 1 });
  });
}

export async function deleteReply(clubId: string, topicId: string, replyId: string): Promise<void> {
  const replyRef = doc(db(), 'clubs', clubId, 'topics', topicId, 'replies', replyId);
  const topicRef = doc(db(), 'clubs', clubId, 'topics', topicId);

  await runTransaction(db(), async (tx) => {
    const topicSnap = await tx.get(topicRef);
    tx.delete(replyRef);
    tx.update(topicRef, { replyCount: Math.max(0, (topicSnap.data()?.replyCount ?? 1) - 1) });
  });
}
