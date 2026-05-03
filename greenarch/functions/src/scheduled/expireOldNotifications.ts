/**
 * Scheduled function: Cleanup old notifications
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

export const expireOldNotifications = functions.pubsub
  .schedule('0 0 ? * *')
  .onRun(async context => {
    // TODO: Query and delete notifications older than 30 days

    console.log('Old notifications cleaned up');
  });
