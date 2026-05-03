/**
 * TypeScript interfaces and types for the entire application
 */

// User types
export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: 'user' | 'partner' | 'gardener' | 'admin';
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Nursery types
export interface Nursery {
  id: string;
  name: string;
  ownerId: string;
  description: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  lat: number;
  lng: number;
  image?: string;
  rating: number;
  totalReviews: number;
  verified: boolean;
  bankDetails?: BankDetails;
  createdAt: Date;
  updatedAt: Date;
}

// Product types
export interface Product {
  id: string;
  nurseryId: string;
  name: string;
  category: string;
  description: string;
  price: number;
  stock: number;
  image: string;
  rating: number;
  totalReviews: number;
  createdAt: Date;
  updatedAt: Date;
}

// Order types
export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  deliveryAddress: Address;
  paymentMethod: string;
  trackingNumber?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
}

// Booking types
export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export interface Booking {
  id: string;
  userId: string;
  gardenerId: string;
  serviceType: string;
  date: Date;
  timeSlot: string;
  notes: string;
  status: BookingStatus;
  totalAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

// Gardener types
export interface Gardener {
  id: string;
  name: string;
  phone: string;
  email: string;
  bio: string;
  skills: string[];
  experience: number; // years
  rating: number;
  totalBookings: number;
  lat: number;
  lng: number;
  image?: string;
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Review types
export interface Review {
  id: string;
  entityId: string; // nurseryId or gardenerId
  entityType: 'nursery' | 'gardener';
  userId: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

// Cart types
export interface CartItem {
  productId: string;
  quantity: number;
  price: number;
}

export interface Cart {
  userId: string;
  items: CartItem[];
  updatedAt: Date;
}

// Address types
export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  lat?: number;
  lng?: number;
}

// Bank details for partners
export interface BankDetails {
  accountHolderName: string;
  accountNumber: string;
  ifscCode: string;
  bankName: string;
}

// Notification types
export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  readAt?: Date;
}

// Payout types
export type PayoutStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface Payout {
  id: string;
  nurseryId: string;
  amount: number;
  status: PayoutStatus;
  bankDetails: BankDetails;
  createdAt: Date;
  updatedAt: Date;
}
