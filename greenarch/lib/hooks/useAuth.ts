/**
 * useAuth Hook - Get current user and auth status
 */
import { useEffect, useState } from 'react';
import { auth } from '../firebase';
import { User, onAuthStateChanged } from 'firebase/auth';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, setUser);
    setLoading(false);
    return unsubscribe;
  }, []);

  return { user, loading };
}
