/**
 * Firestore Query Functions for Orders Collection
 */
import { db } from '../firebase';
import { collection, query, where, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';

export async function getOrder(orderId: string) {
  const docRef = doc(db, 'orders', orderId);
  return getDoc(docRef);
}

export async function getOrdersByUser(userId: string) {
  const q = query(collection(db, 'orders'), where('userId', '==', userId));
  return getDocs(q);
}

export async function getOrdersByNursery(nurseryId: string) {
  const q = query(collection(db, 'orders'), where('nurseryId', '==', nurseryId));
  return getDocs(q);
}

export async function updateOrderStatus(orderId: string, status: string) {
  const docRef = doc(db, 'orders', orderId);
  return updateDoc(docRef, { status, updatedAt: new Date() });
}
