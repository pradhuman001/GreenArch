import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from './firebase-admin';

/**
 * Middleware to verify authentication and check user role
 */
export async function verifyToken(req: NextRequest) {
  const token = req.headers.get('authorization')?.split(' ')[1];

  if (!token) {
    return { user: null, error: 'No token provided' };
  }

  try {
    const decoded = await adminAuth.verifyIdToken(token);
    return { user: decoded, error: null };
  } catch (error) {
    return { user: null, error: 'Invalid token' };
  }
}

/**
 * Check if user has a specific role
 */
export async function checkUserRole(userId: string, role: string) {
  try {
    const user = await adminAuth.getUser(userId);
    return user.customClaims?.role === role;
  } catch {
    return false;
  }
}
