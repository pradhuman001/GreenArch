/**
 * Firestore Query Functions for Carts Collection
 */
import { db } from '../firebase';
import { doc, getDoc, setDoc, updateDoc, deleteField } from 'firebase/firestore';

export async function getCart(userId: string) {
  const docRef = doc(db, 'carts', userId);
  return getDoc(docRef);
}

export async function updateCart(userId: string, items: any) {
  const docRef = doc(db, 'carts', userId);
  return setDoc(docRef, { items, updatedAt: new Date() }, { merge: true });
}

export async function clearCart(userId: string) {
  const docRef = doc(db, 'carts', userId);
  return updateDoc(docRef, { items: deleteField() });
}
