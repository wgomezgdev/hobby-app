import { useEffect, useState } from 'react';
import {
  collection, doc, getDoc, limit, onSnapshot, orderBy, query,
  type DocumentSnapshot,
} from 'firebase/firestore';
import { firestoreDb } from '../lib/firebase';
import type { Club, ClubDiscussionTopic, ClubMember, ClubPost, ClubReply } from '../types/clubs';

const PAGE_SIZE = 20;

export function useClub(clubId: string): { club: Club | null; loading: boolean } {
  const [club, setClub] = useState<Club | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!firestoreDb || !clubId) { setLoading(false); return; }
    const unsub = onSnapshot(doc(firestoreDb, 'clubs', clubId), (snap) => {
      setClub(snap.exists() ? (snap.data() as Club) : null);
      setLoading(false);
    });
    return unsub;
  }, [clubId]);

  return { club, loading };
}

export function useClubMembers(clubId: string): ClubMember[] {
  const [members, setMembers] = useState<ClubMember[]>([]);

  useEffect(() => {
    if (!firestoreDb || !clubId) return;
    const q = query(collection(firestoreDb, 'clubs', clubId, 'members'), orderBy('joinedAt', 'asc'));
    const unsub = onSnapshot(q, (snap) => {
      setMembers(snap.docs.map(d => d.data() as ClubMember));
    });
    return unsub;
  }, [clubId]);

  return members;
}

export function useClubPosts(clubId: string): {
  posts: ClubPost[];
  loadMore: () => void;
  hasMore: boolean;
  loading: boolean;
} {
  const [posts, setPosts] = useState<ClubPost[]>([]);
  const [lastVisible, setLastVisible] = useState<DocumentSnapshot | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [pageLimit, setPageLimit] = useState(PAGE_SIZE);

  useEffect(() => {
    if (!firestoreDb || !clubId) { setLoading(false); return; }
    const q = query(
      collection(firestoreDb, 'clubs', clubId, 'posts'),
      orderBy('createdAt', 'desc'),
      limit(pageLimit)
    );
    const unsub = onSnapshot(q, (snap) => {
      const fetched = snap.docs.map(d => d.data() as ClubPost);
      setPosts(fetched);
      setLastVisible(snap.docs[snap.docs.length - 1] ?? null);
      setHasMore(fetched.length === pageLimit);
      setLoading(false);
    });
    return unsub;
  }, [clubId, pageLimit]);

  const loadMore = () => {
    if (lastVisible) setPageLimit(prev => prev + PAGE_SIZE);
  };

  return { posts, loadMore, hasMore, loading };
}

export function useClubTopics(clubId: string): ClubDiscussionTopic[] {
  const [topics, setTopics] = useState<ClubDiscussionTopic[]>([]);

  useEffect(() => {
    if (!firestoreDb || !clubId) return;
    const q = query(collection(firestoreDb, 'clubs', clubId, 'topics'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setTopics(snap.docs.map(d => d.data() as ClubDiscussionTopic));
    });
    return unsub;
  }, [clubId]);

  return topics;
}

export function useTopicReplies(clubId: string, topicId: string): ClubReply[] {
  const [replies, setReplies] = useState<ClubReply[]>([]);

  useEffect(() => {
    if (!firestoreDb || !clubId || !topicId) return;
    const q = query(
      collection(firestoreDb, 'clubs', clubId, 'topics', topicId, 'replies'),
      orderBy('createdAt', 'asc')
    );
    const unsub = onSnapshot(q, (snap) => {
      setReplies(snap.docs.map(d => d.data() as ClubReply));
    });
    return unsub;
  }, [clubId, topicId]);

  return replies;
}

export function useUserClubs(uid: string): { clubs: Club[]; loading: boolean } {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!firestoreDb || !uid) { setLoading(false); return; }
    const q = query(
      collection(firestoreDb, 'userClubs', uid, 'clubs'),
      orderBy('joinedAt', 'desc')
    );
    const unsub = onSnapshot(q, async (snap) => {
      const results: Club[] = [];
      for (const mirrorDoc of snap.docs) {
        const { clubId } = mirrorDoc.data();
        const clubSnap = await getDoc(doc(firestoreDb!, 'clubs', clubId));
        if (clubSnap.exists()) results.push(clubSnap.data() as Club);
      }
      setClubs(results);
      setLoading(false);
    });
    return unsub;
  }, [uid]);

  return { clubs, loading };
}
