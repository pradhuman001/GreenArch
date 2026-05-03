import { getApp, getApps, initializeApp } from 'firebase/app'
import { connectAuthEmulator, getAuth } from 'firebase/auth'
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore'
import { connectStorageEmulator, getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

const app = getApps().length ? getApp() : initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)

const globalForFirebase = globalThis as typeof globalThis & {
  __firebaseEmulatorsConnected?: boolean
}

const useEmulator = process.env.NEXT_PUBLIC_USE_EMULATOR === 'true'
const emulatorHost = process.env.NEXT_PUBLIC_EMULATOR_HOST || '127.0.0.1'
const firestorePort = Number(process.env.NEXT_PUBLIC_FIRESTORE_EMULATOR_PORT || 8080)
const authPort = Number(process.env.NEXT_PUBLIC_AUTH_EMULATOR_PORT || 9099)
const storagePort = Number(process.env.NEXT_PUBLIC_STORAGE_EMULATOR_PORT || 9199)

if (useEmulator && !globalForFirebase.__firebaseEmulatorsConnected) {
  connectAuthEmulator(auth, `http://${emulatorHost}:${authPort}`, { disableWarnings: true })
  connectFirestoreEmulator(db, emulatorHost, firestorePort)
  connectStorageEmulator(storage, emulatorHost, storagePort)
  globalForFirebase.__firebaseEmulatorsConnected = true
}
