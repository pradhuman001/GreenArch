/**
 * Firestore Query Functions for Gardeners Collection
 */
import { db } from '../firebase';
import { collection, query, where, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';

export async function getGardener(gardenerId: string) {
  const docRef = doc(db, 'gardeners', gardenerId);
  return getDoc(docRef);
}

export async function getGardenersByLocation(lat: number, lng: number, radius: number) {
  // TODO: Use GeoFirestore for location-based queries
  return null;
}

export async function updateGardener(gardenerId: string, data: any) {
  const docRef = doc(db, 'gardeners', gardenerId);
  return updateDoc(docRef, data);
}
