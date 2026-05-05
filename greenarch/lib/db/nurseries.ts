import { db } from '@/lib/firebase';
import { Nursery } from '@/types';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';

const nurseriesCollection = collection(db, 'nurseries');

export async function getNursery(id: string): Promise<Nursery | null> {
  const nurserySnap = await getDoc(doc(db, 'nurseries', id));

  if (!nurserySnap.exists()) {
    return null;
  }

  return {
    id: nurserySnap.id,
    ...(nurserySnap.data() as Omit<Nursery, 'id'>),
  } as Nursery;
}

export async function getNurseriesByOwner(ownerId: string): Promise<Nursery[]> {
  const nurseriesQuery = query(nurseriesCollection, where('ownerId', '==', ownerId));
  const querySnap = await getDocs(nurseriesQuery);

  return querySnap.docs.map((nurseryDoc) => ({
    id: nurseryDoc.id,
    ...(nurseryDoc.data() as Omit<Nursery, 'id'>),
  })) as Nursery[];
}

export async function createNursery(
  data: Omit<Nursery, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const docRef = await addDoc(nurseriesCollection, {
    ...data,
    rating: 0,
    reviewCount: 0,
    isVerified: false,
    isActive: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return docRef.id;
}

export async function updateNursery(id: string, data: Partial<Nursery>): Promise<void> {
  await updateDoc(doc(db, 'nurseries', id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function getAllNurseries(): Promise<Nursery[]> {
  const querySnap = await getDocs(collection(db, 'nurseries'));
  return querySnap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Nursery, 'id'>) })) as Nursery[];
}
