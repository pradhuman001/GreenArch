import { db } from '@/lib/firebase';
import { Product } from '@/types';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';

const productsCollection = collection(db, 'products');

export async function getProduct(id: string): Promise<Product | null> {
  const productSnap = await getDoc(doc(db, 'products', id));

  if (!productSnap.exists()) {
    return null;
  }

  return {
    id: productSnap.id,
    ...(productSnap.data() as Omit<Product, 'id'>),
  } as Product;
}

export async function getProductsByNursery(nurseryId: string): Promise<Product[]> {
  const productsQuery = query(
    productsCollection,
    where('nurseryId', '==', nurseryId),
    where('isAvailable', '==', true)
  );
  const querySnap = await getDocs(productsQuery);

  return querySnap.docs.map((productDoc) => ({
    id: productDoc.id,
    ...(productDoc.data() as Omit<Product, 'id'>),
  })) as Product[];
}

export async function getFeaturedProducts(): Promise<Product[]> {
  const featuredQuery = query(
    productsCollection,
    where('isFeatured', '==', true),
    where('isAvailable', '==', true)
  );
  const querySnap = await getDocs(featuredQuery);

  return querySnap.docs.map((productDoc) => ({
    id: productDoc.id,
    ...(productDoc.data() as Omit<Product, 'id'>),
  })) as Product[];
}

export async function createProduct(
  data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const docRef = await addDoc(productsCollection, {
    ...data,
    rating: 0,
    reviewCount: 0,
    totalSold: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return docRef.id;
}

export async function updateProduct(id: string, data: Partial<Product>): Promise<void> {
  await updateDoc(doc(db, 'products', id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteProduct(id: string): Promise<void> {
  await deleteDoc(doc(db, 'products', id));
}
