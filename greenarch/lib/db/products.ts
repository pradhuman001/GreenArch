/**
 * Firestore Query Functions for Products Collection
 */
import { db } from '@/lib/firebase';
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  orderBy,
  limit,
  Timestamp,
} from 'firebase/firestore';
import { Product } from '@/types';

const productsCollection = collection(db, 'products');

/**
 * Get a single product by ID
 */
export async function getProduct(productId: string): Promise<Product | null> {
  try {
    const productDoc = await getDoc(doc(db, 'products', productId));
    if (!productDoc.exists()) return null;
    return { id: productDoc.id, ...productDoc.data() } as Product;
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}

/**
 * Get all products from a specific nursery
 */
export async function getProductsByNursery(nurseryId: string): Promise<Product[]> {
  try {
    const q = query(productsCollection, where('nurseryId', '==', nurseryId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Product));
  } catch (error) {
    console.error('Error fetching products by nursery:', error);
    return [];
  }
}

/**
 * Get products by category
 */
export async function getProductsByCategory(category: string): Promise<Product[]> {
  try {
    const q = query(productsCollection, where('category', '==', category));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Product));
  } catch (error) {
    console.error('Error fetching products by category:', error);
    return [];
  }
}

/**
 * Get top-rated products
 */
export async function getTopRatedProducts(limitCount: number = 10): Promise<Product[]> {
  try {
    const q = query(productsCollection);
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() } as Product))
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, limitCount);
  } catch (error) {
    console.error('Error fetching top-rated products:', error);
    return [];
  }
}

/**
 * Get in-stock products
 */
export async function getInStockProducts(): Promise<Product[]> {
  try {
    const q = query(productsCollection, where('stock', '>', 0));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Product));
  } catch (error) {
    console.error('Error fetching in-stock products:', error);
    return [];
  }
}

/**
 * Search products by name
 */
export async function searchProducts(searchTerm: string): Promise<Product[]> {
  try {
    const q = query(productsCollection);
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() } as Product))
      .filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
  } catch (error) {
    console.error('Error searching products:', error);
    return [];
  }
}

/**
 * Update product information
 */
export async function updateProduct(productId: string, updates: Partial<Product>): Promise<void> {
  try {
    await updateDoc(doc(db, 'products', productId), {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
}
