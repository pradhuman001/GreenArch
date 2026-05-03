/**
 * Firestore trigger: When order status changes
 * - Notify user on status update
 * - Update partner notification
 */

import * as functions from 'firebase-functions';

export const onOrderStatusChanged = functions.firestore
  .document('orders/{orderId}')
  .onUpdate(async change => {
    const oldOrder = change.before.data();
    const newOrder = change.after.data();

    if (oldOrder.status !== newOrder.status) {
      // TODO: Send notification to user
      // TODO: Notify partner
      console.log(`Order status changed: ${oldOrder.status} -> ${newOrder.status}`);
    }
  });
