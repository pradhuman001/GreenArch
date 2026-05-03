/**
 * Unit tests for calculateCommission utility
 */

import { calculateCommission, getNetAmount } from '../lib/utils/calculateCommission';

describe('calculateCommission', () => {
  it('should calculate 15% commission by default', () => {
    expect(calculateCommission(1000)).toBe(150);
  });

  it('should calculate custom commission percentage', () => {
    expect(calculateCommission(1000, 10)).toBe(100);
    expect(calculateCommission(1000, 20)).toBe(200);
  });
});

describe('getNetAmount', () => {
  it('should return net amount after commission', () => {
    expect(getNetAmount(1000)).toBe(850);
    expect(getNetAmount(1000, 10)).toBe(900);
  });
});
