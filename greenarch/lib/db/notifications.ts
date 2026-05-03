/**
 * Firestore Query Functions for Notifications Collection
 */
import { db } from '../firebase';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';

export async function getNotifications(userId: string) {
  const q = query(collection(db, 'notifications'), where('userId', '==', userId));
  return getDocs(q);
}

export async function markAsRead(notificationId: string) {
  const docRef = doc(db, 'notifications', notificationId);
  return updateDoc(docRef, { read: true, readAt: new Date() });
}
