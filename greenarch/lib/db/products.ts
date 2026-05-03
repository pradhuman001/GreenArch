/**
 * Firestore Query Functions for Products Collection
 */
import { db } from '../firebase';
import { collection, query, where, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';

export async function getProduct(productId: string) {
  const docRef = doc(db, 'products', productId);
  return getDoc(docRef);
}

export async function getProductsByNursery(nurseryId: string) {
  const q = query(collection(db, 'products'), where('nurseryId', '==', nurseryId));
  return getDocs(q);
}

export async function getProductsByCategory(category: string) {
  const q = query(collection(db, 'products'), where('category', '==', category));
  return getDocs(q);
}

export async function updateProduct(productId: string, data: any) {
  const docRef = doc(db, 'products', productId);
  return updateDoc(docRef, data);
}
