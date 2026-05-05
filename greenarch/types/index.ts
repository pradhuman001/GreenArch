/**
 * GreenArch - TypeScript types and interfaces for Next.js + Firebase Firestore app
 */

import { Timestamp, GeoPoint } from 'firebase/firestore';

/**
 * Address
 * Represents a physical address with optional geolocation
 */
export interface Address {
  id: string;
  label: string;
  line1: string;
  line2?: string;
  city: string;
  pincode: string;
  state: string;
  geopoint?: GeoPoint;
}

/**
 * User
 * Represents a user in the GreenArch platform
 */
export interface User {
  uid: string;
  name: string;
  email: string;
  phone: string;
  role: 'user' | 'partner' | 'admin';
  profilePhoto?: string;
  isVerified: boolean;
  addresses: Address[];
  defaultAddressId?: string;
  fcmToken?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * Nursery
 * Represents a plant nursery business
 */
export interface Nursery {
  id: string;
  ownerId: string;
  name: string;
  description?: string;
  phone: string;
  email: string;
  address: {
    line1: string;
    city: string;
    pincode: string;
    state: string;
  };
  location: GeoPoint;
  geohash: string;
  deliveryRadiusKm: number;
  isOpen: boolean;
  images: string[];
  logo?: string;
  rating: number;
  reviewCount: number;
  isVerified: boolean;
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * Product Category Type
 */
export type ProductCategory =
  | 'indoor'
  | 'outdoor'
  | 'succulents'
  | 'herbs'
  | 'flowering'
  | 'trees'
  | 'pots'
  | 'tools'
  | 'soil';

/**
 * Product
 * Represents a product in a nursery catalog
 */
export interface Product {
  id: string;
  nurseryId: string;
  name: string;
  slug: string;
  description: string;
  category: ProductCategory;
  tags: string[];
  images: string[];
  price: number;
  discountedPrice?: number;
  stock: number;
  isAvailable: boolean;
  isFeatured: boolean;
  rating: number;
  reviewCount: number;
  weight?: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * Order Status Type
 */
export type OrderStatus =
  | 'placed'
  | 'confirmed'
  | 'preparing'
  | 'dispatched'
  | 'delivered'
  | 'cancelled';

/**
 * Order Item
 * Represents a single product in an order
 */
export interface OrderItem {
  productId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  subtotal: number;
}

/**
 * Order
 * Represents a customer order
 */
export interface Order {
  id: string;
  userId: string;
  nurseryId: string;
  items: OrderItem[];
  status: OrderStatus;
  deliveryAddress: Address;
  pricing: {
    subtotal: number;
    deliveryFee: number;
    discount: number;
    total: number;
  };
  payment: {
    method: string;
    status: string;
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
  };
  isReviewed: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * Gardener
 * Represents a professional gardener/landscaper
 */
export interface Gardener {
  id: string;
  userId: string;
  name: string;
  phone: string;
  profilePhoto?: string;
  experienceYears: number;
  services: string[];
  ratePerHour: number;
  rating: number;
  reviewCount: number;
  isVerified: boolean;
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * Booking Status Type
 */
export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'no_show';

/**
 * Booking
 * Represents a gardening service booking
 */
export interface Booking {
  id: string;
  userId: string;
  gardenerId: string;
  serviceType: string;
  serviceAddress: Address;
  slotDate: string;
  slotTime: string;
  status: BookingStatus;
  pricing: {
    amount: number;
    platformFee: number;
    total: number;
  };
  payment?: {
  method: string;
  status: string;
  razorpayPaymentId?: string;
};
  isReviewed: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * Cart Item
 * Represents a product in the shopping cart
 */
export interface CartItem {
  productId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  maxQuantity: number;
}

/**
 * Cart
 * Represents a user's shopping cart
 */
export interface Cart {
  userId: string;
  nurseryId: string;
  nurseryName: string;
  items: CartItem[];
  discountAmount: number;
  updatedAt: Timestamp;
}
