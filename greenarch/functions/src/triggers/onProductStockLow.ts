/**
 * Firestore trigger: When product stock is low
 * - Alert nursery partner
 */

import * as functions from 'firebase-functions';

export const onProductStockLow = functions.firestore
  .document('products/{productId}')
  .onUpdate(async change => {
    const newProduct = change.after.data();

    if (newProduct.stock < 5) {
      // TODO: Send alert to nursery partner
      console.log(`Low stock alert: ${newProduct.name} (${newProduct.stock} units)`);
    }
  });
