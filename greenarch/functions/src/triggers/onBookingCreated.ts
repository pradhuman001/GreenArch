/**
 * Firestore trigger: When booking is created
 * - Notify gardener
 * - Send user confirmation
 */

import * as functions from 'firebase-functions';

export const onBookingCreated = functions.firestore
  .document('bookings/{bookingId}')
  .onCreate(async snapshot => {
    const booking = snapshot.data();

    // TODO: Send notification to gardener
    // TODO: Send confirmation to user

    console.log(`Booking created: ${snapshot.id}`);
  });
