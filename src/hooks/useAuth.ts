import { useState, useEffect } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut as fbSignOut, type User } from 'firebase/auth';
import { auth, googleProvider, isFirebaseConfigured } from '../lib/firebase';
import { autoSyncOnSignIn } from '../lib/firestoreSync';

export function useAuth() {
  const [user, setUser] = useState<User | null | undefined>(
    isFirebaseConfigured ? undefined : null
  );

  useEffect(() => {
    if (!auth) return;
    return onAuthStateChanged(auth, async (u) => {
      if (u && !user) {
        try { await autoSyncOnSignIn(u.uid); } catch { /* silent */ }
      }
      setUser(u);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signIn = async () => {
    if (!auth) return;
    await signInWithPopup(auth, googleProvider);
  };

  const signOut = async () => {
    if (!auth) return;
    await fbSignOut(auth);
  };

  return {
    user,
    loading: user === undefined,
    isConfigured: isFirebaseConfigured,
    signIn,
    signOut,
  };
}
