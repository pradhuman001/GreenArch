/**
 * Firestore Query Functions for Nurseries Collection
 */
import { db } from '@/lib/firebase';
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  QueryConstraint,
  Timestamp,
} from 'firebase/firestore';
import { Nursery } from '@/types';

const nurseriesCollection = collection(db, 'nurseries');

/**
 * Get a single nursery by ID
 */
export async function getNursery(nurseryId: string): Promise<Nursery | null> {
  try {
    const nurseryDoc = await getDoc(doc(db, 'nurseries', nurseryId));
    if (!nurseryDoc.exists()) return null;
    return { id: nurseryDoc.id, ...nurseryDoc.data() } as Nursery;
  } catch (error) {
    console.error('Error fetching nursery:', error);
    return null;
  }
}

/**
 * Get all nurseries with optional filters
 */
export async function getNurseries(constraints: QueryConstraint[] = []): Promise<Nursery[]> {
  try {
    const q = query(nurseriesCollection, ...constraints);
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Nursery));
  } catch (error) {
    console.error('Error fetching nurseries:', error);
    return [];
  }
}

/**
 * Get verified nurseries
 */
export async function getVerifiedNurseries(): Promise<Nursery[]> {
  try {
    const q = query(nurseriesCollection, where('verified', '==', true));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Nursery));
  } catch (error) {
    console.error('Error fetching verified nurseries:', error);
    return [];
  }
}

/**
 * Get nurseries by owner
 */
export async function getNurseriesByOwner(ownerId: string): Promise<Nursery[]> {
  try {
    const q = query(nurseriesCollection, where('ownerId', '==', ownerId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Nursery));
  } catch (error) {
    console.error('Error fetching nurseries by owner:', error);
    return [];
  }
}

/**
 * Get top-rated nurseries
 */
export async function getTopRatedNurseries(limit: number = 10): Promise<Nursery[]> {
  try {
    const q = query(
      nurseriesCollection,
      where('verified', '==', true),
      // orderBy would need proper index setup
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() } as Nursery))
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, limit);
  } catch (error) {
    console.error('Error fetching top-rated nurseries:', error);
    return [];
  }
}

/**
 * Update nursery information
 */
export async function updateNursery(nurseryId: string, updates: Partial<Nursery>): Promise<void> {
  try {
    await updateDoc(doc(db, 'nurseries', nurseryId), {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating nursery:', error);
    throw error;
  }
}
