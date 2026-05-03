/**
 * Firestore trigger: When order is created
 * - Send confirmation email + SMS
 * - Create notification
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

export const onOrderCreated = functions.firestore
  .document('orders/{orderId}')
  .onCreate(async snapshot => {
    const order = snapshot.data();
    const userId = order.userId;

    // TODO: Send confirmation email
    // TODO: Send SMS notification
    // TODO: Create notification document

    console.log(`Order created: ${snapshot.id}`);
  });
