/**
 * Firestore Query Functions for Users Collection
 */
import { db } from './firebase';
import { collection, query, where, getDocs, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

export async function getUser(userId: string) {
  const docRef = doc(db, 'users', userId);
  return getDoc(docRef);
}

export async function getUsersByRole(role: string) {
  const q = query(collection(db, 'users'), where('role', '==', role));
  return getDocs(q);
}

export async function updateUser(userId: string, data: any) {
  const docRef = doc(db, 'users', userId);
  return updateDoc(docRef, data);
}
