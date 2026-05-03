import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'
import { db } from '../firebase'

export async function getUserById(userId: string) {
  if (!userId) return null
  const ref = doc(db, 'users', userId)
  const snap = await getDoc(ref)
  return snap.exists() ? (snap.data() as any) : null
}

export async function createUser(userId: string, data: Record<string, any>) {
  const ref = doc(db, 'users', userId)
  await setDoc(ref, data)
  return { id: userId, ...data }
}

export async function updateUser(userId: string, patch: Partial<Record<string, any>>) {
  const ref = doc(db, 'users', userId)
  await updateDoc(ref, patch)
  return true
}
/**
 * Firestore Query Functions for Users Collection
 */
import { db } from '@/lib/firebase';
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  setDoc,
  updateDoc,
  Timestamp,
} from 'firebase/firestore';
import { User } from '@/types';

const usersCollection = collection(db, 'users');

/**
 * Get a user by ID
 */
export async function getUser(userId: string): Promise<User | null> {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) return null;
    return { id: userDoc.id, ...userDoc.data() } as User;
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
}

/**
 * Get a user by email
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const q = query(usersCollection, where('email', '==', email));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) return null;
    const userDoc = querySnapshot.docs[0];
    return { id: userDoc.id, ...userDoc.data() } as User;
  } catch (error) {
    console.error('Error fetching user by email:', error);
    return null;
  }
}

/**
 * Create a new user document
 */
export async function createUser(userId: string, userData: Partial<User>): Promise<User> {
  try {
    const newUser: User = {
      id: userId,
      email: userData.email || '',
      name: userData.name || '',
      phone: userData.phone || '',
      role: userData.role || 'user',
      avatar: userData.avatar || '',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    await setDoc(doc(db, 'users', userId), newUser);
    return newUser;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

/**
 * Update user information
 */
export async function updateUser(userId: string, updates: Partial<User>): Promise<void> {
  try {
    await updateDoc(doc(db, 'users', userId), {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
}

/**
 * Get all users (admin only)
 */
export async function getAllUsers(): Promise<User[]> {
  try {
    const querySnapshot = await getDocs(usersCollection);
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as User));
  } catch (error) {
    console.error('Error fetching all users:', error);
    return [];
  }
}

/**
 * Get users by role
 */
export async function getUsersByRole(role: string): Promise<User[]> {
  try {
    const q = query(usersCollection, where('role', '==', role));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as User));
  } catch (error) {
    console.error('Error fetching users by role:', error);
    return [];
  }
}
