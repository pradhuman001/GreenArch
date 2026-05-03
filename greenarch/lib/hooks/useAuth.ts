/**
 * useAuth Hook - Get current user and auth status
 * This hook provides the current Firebase user and authentication state
 */
'use client';

import { useEffect, useState } from 'react';
import { auth } from '@/lib/firebase';
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';

export function useAuth() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    
    const unsubscribe = onAuthStateChanged(
      auth,
      (firebaseUser) => {
        setUser(firebaseUser);
        setLoading(false);
        setError(null);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { user, loading, error };
}
