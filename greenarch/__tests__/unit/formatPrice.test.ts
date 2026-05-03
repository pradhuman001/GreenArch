/**
 * Unit tests for formatPrice utility
 */

import { formatPrice } from '../lib/utils/formatPrice';

describe('formatPrice', () => {
  it('should format price with INR symbol', () => {
    expect(formatPrice(1000)).toBe('₹1,000.00');
    expect(formatPrice(1200.50)).toBe('₹1,200.50');
  });

  it('should handle zero', () => {
    expect(formatPrice(0)).toBe('₹0.00');
  });

  it('should handle large numbers', () => {
    expect(formatPrice(1000000)).toBe('₹10,00,000.00');
  });
});
