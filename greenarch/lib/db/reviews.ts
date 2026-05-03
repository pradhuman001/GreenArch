/**
 * Firestore Query Functions for Reviews Collection
 */
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

export async function getReviewsByNursery(nurseryId: string) {
  const q = query(collection(db, 'reviews'), where('nurseryId', '==', nurseryId));
  return getDocs(q);
}

export async function getReviewsByGardener(gardenerId: string) {
  const q = query(collection(db, 'reviews'), where('gardenerId', '==', gardenerId));
  return getDocs(q);
}

export async function getAverageRating(nurseryId: string) {
  const q = query(collection(db, 'reviews'), where('nurseryId', '==', nurseryId));
  const docs = await getDocs(q);
  const ratings = docs.docs.map(doc => doc.data().rating);
  return ratings.reduce((a, b) => a + b, 0) / ratings.length || 0;
}
