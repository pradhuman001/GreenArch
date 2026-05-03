/**
 * HTTP Callable Function: Set user role
 * Admin only - Sets custom claims via Admin SDK
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

export const setUserRole = functions.https.onCall(async (data, context) => {
  // TODO: Verify admin status
  if (!context.auth?.uid) {
    throw new functions.https.HttpsError('unauthenticated', 'Not authenticated');
  }

  const { userId, role } = data;

  try {
    // TODO: Set custom claims
    return { success: true, role };
  } catch (error) {
    throw new functions.https.HttpsError('internal', 'Failed to set role');
  }
});
