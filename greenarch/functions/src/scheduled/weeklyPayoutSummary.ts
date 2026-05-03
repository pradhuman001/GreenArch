/**
 * Scheduled function: Every Monday - Send payout summary
 */

import * as functions from 'firebase-functions';

export const weeklyPayoutSummary = functions.pubsub.schedule('0 9 ? * MON').onRun(async context => {
  // TODO: Calculate payouts for all partners
  // TODO: Send email summaries

  console.log('Weekly payout summary sent');
});
