/**
 * Calculate commission percentage
 */
export function calculateCommission(amount: number, percentage: number = 15): number {
  return (amount * percentage) / 100;
}

export function getNetAmount(amount: number, percentage: number = 15): number {
  return amount - calculateCommission(amount, percentage);
}
