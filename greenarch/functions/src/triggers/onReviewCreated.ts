/**
 * Firestore trigger: When review is created
 * - Update rating average on nursery/gardener
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

export const onReviewCreated = functions.firestore
  .document('reviews/{reviewId}')
  .onCreate(async snapshot => {
    const review = snapshot.data();
    const { entityId, entityType, rating } = review;

    // TODO: Calculate average rating
    // TODO: Update nursery/gardener rating field

    console.log(`Review created for ${entityType}: ${entityId}`);
  });
