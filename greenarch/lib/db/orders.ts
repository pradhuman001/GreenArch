import { db } from '../firebase'
import { collection, query, where, getDocs, doc, getDoc, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore'

import { Address, OrderItem, OrderStatus } from '@/types'

type CreateOrderInput = {
  userId: string
  nurseryId: string
  items: OrderItem[]
  deliveryAddress: Address
  pricing: {
    subtotal: number
    deliveryFee: number
    discount: number
    total: number
  }
  payment: {
    method: 'cod' | 'razorpay'
    status: 'pending' | 'paid' | 'failed'
    razorpayOrderId?: string
    razorpayPaymentId?: string
  }
  status?: OrderStatus
}

export async function createOrder(input: CreateOrderInput): Promise<string> {
  const docRef = await addDoc(collection(db, 'orders'), {
    userId: input.userId,
    nurseryId: input.nurseryId,
    items: input.items,
    status: input.status ?? 'placed',
    deliveryAddress: input.deliveryAddress,
    pricing: input.pricing,
    payment: input.payment,
    isReviewed: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })

  return docRef.id
}

export async function getOrder(orderId: string) {
  const docRef = doc(db, 'orders', orderId)
  return getDoc(docRef)
}

export async function getOrdersByUser(userId: string) {
  const q = query(collection(db, 'orders'), where('userId', '==', userId))
  return getDocs(q)
}

export async function getOrdersByNursery(nurseryId: string) {
  const q = query(collection(db, 'orders'), where('nurseryId', '==', nurseryId))
  return getDocs(q)
}

export async function updateOrderStatus(orderId: string, status: string) {
  const docRef = doc(db, 'orders', orderId)
  return updateDoc(docRef, { status, updatedAt: new Date() })
}
