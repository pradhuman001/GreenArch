/**
 * Validate Indian phone number
 */
export function validatePhone(phone: string): boolean {
  // Indian phone numbers: 10 digits, starting with 6-9
  const regex = /^[6-9]\d{9}$/;
  return regex.test(phone.replace(/\D/g, ''));
}
