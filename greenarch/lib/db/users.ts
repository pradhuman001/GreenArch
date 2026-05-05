import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

import { db } from '@/lib/firebase';
import { User } from '@/types';

export async function getUser(uid: string): Promise<User | null> {
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    return null;
  }

  return {
    uid: userSnap.id,
    ...(userSnap.data() as Omit<User, 'uid'>),
  } as User;
}

export async function createUser(uid: string, data: Partial<User>): Promise<void> {
  const userRef = doc(db, 'users', uid);

  await setDoc(userRef, {
    uid,
    ...data,
    role: data.role ?? 'user',
    isVerified: data.isVerified ?? false,
    addresses: data.addresses ?? [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateUser(uid: string, data: Partial<User>): Promise<void> {
  const userRef = doc(db, 'users', uid);

  await updateDoc(userRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}
