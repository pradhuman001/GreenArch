/**
 * Firestore Query Functions for Bookings Collection
 */
import { db } from '../firebase';
import { collection, query, where, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';

export async function getBooking(bookingId: string) {
  const docRef = doc(db, 'bookings', bookingId);
  return getDoc(docRef);
}

export async function getBookingsByUser(userId: string) {
  const q = query(collection(db, 'bookings'), where('userId', '==', userId));
  return getDocs(q);
}

export async function getBookingsByGardener(gardenerId: string) {
  const q = query(collection(db, 'bookings'), where('gardenerId', '==', gardenerId));
  return getDocs(q);
}

export async function updateBookingStatus(bookingId: string, status: string) {
  const docRef = doc(db, 'bookings', bookingId);
  return updateDoc(docRef, { status, updatedAt: new Date() });
}
