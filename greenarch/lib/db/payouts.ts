/**
 * Firestore Query Functions for Payouts Collection
 */
import { db } from '../firebase';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';

export async function getPayoutsByNursery(nurseryId: string) {
  const q = query(collection(db, 'payouts'), where('nurseryId', '==', nurseryId));
  return getDocs(q);
}

export async function updatePayoutStatus(payoutId: string, status: string) {
  const docRef = doc(db, 'payouts', payoutId);
  return updateDoc(docRef, { status, updatedAt: new Date() });
}
