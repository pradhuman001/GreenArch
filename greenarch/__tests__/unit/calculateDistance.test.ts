/**
 * Unit tests for calculateDistance utility
 */

import { calculateDistance } from '../lib/utils/calculateDistance';

describe('calculateDistance', () => {
  it('should calculate distance between two coordinates', () => {
    // Test with two nearby points
    const distance = calculateDistance(28.7041, 77.1025, 28.7245, 77.1042);
    expect(distance).toBeGreaterThan(0);
    expect(distance).toBeLessThan(5); // Should be a few kilometers
  });

  it('should return 0 for same coordinates', () => {
    expect(calculateDistance(28.7041, 77.1025, 28.7041, 77.1025)).toBe(0);
  });
});
