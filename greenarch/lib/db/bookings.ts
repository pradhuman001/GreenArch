/**
 * Firestore Query Functions for Bookings Collection
 */
import { db } from '../firebase'
import { addDoc, collection, doc, getDoc, getDocs, query, serverTimestamp, updateDoc, where } from 'firebase/firestore'

import { Address, Booking, BookingStatus } from '@/types'

type CreateBookingInput = {
  userId: string
  gardenerId: string
  serviceType: string
  serviceAddress: Address
  slotDate: string
  slotTime: string
  pricing: {
    amount: number
    platformFee: number
    total: number
  }
  status?: BookingStatus
}

export async function createBooking(input: CreateBookingInput): Promise<string> {
  const docRef = await addDoc(collection(db, 'bookings'), {
    userId: input.userId,
    gardenerId: input.gardenerId,
    serviceType: input.serviceType,
    serviceAddress: input.serviceAddress,
    slotDate: input.slotDate,
    slotTime: input.slotTime,
    status: input.status ?? 'pending',
    pricing: input.pricing,
    isReviewed: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })

  return docRef.id
}

export async function getBooking(bookingId: string) {
  const docRef = doc(db, 'bookings', bookingId)
  return getDoc(docRef)
}

export async function getBookingsByUser(userId: string) {
  const q = query(collection(db, 'bookings'), where('userId', '==', userId))
  return getDocs(q)
}

export async function getBookingsByGardener(gardenerId: string) {
  const q = query(collection(db, 'bookings'), where('gardenerId', '==', gardenerId))
  return getDocs(q)
}

export async function updateBookingStatus(bookingId: string, status: string) {
  const docRef = doc(db, 'bookings', bookingId)
  return updateDoc(docRef, { status, updatedAt: new Date() })
}
