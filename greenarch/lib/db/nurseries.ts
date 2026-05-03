/**
 * Firestore Query Functions for Nurseries Collection
 */
import { db } from '../firebase';
import { collection, query, where, getDocs, doc, getDoc, updateDoc, QueryConstraint } from 'firebase/firestore';

export async function getNursery(nurseryId: string) {
  const docRef = doc(db, 'nurseries', nurseryId);
  return getDoc(docRef);
}

export async function getNurseries(constraints: QueryConstraint[] = []) {
  const q = query(collection(db, 'nurseries'), ...constraints);
  return getDocs(q);
}

export async function getNurseriesByLocation(lat: number, lng: number, radius: number) {
  // TODO: Use GeoFirestore for location-based queries
  return null;
}

export async function updateNursery(nurseryId: string, data: any) {
  const docRef = doc(db, 'nurseries', nurseryId);
  return updateDoc(docRef, data);
}
