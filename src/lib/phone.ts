/**
 * Light normalization for Saudi mobile numbers (store as 05XXXXXXXX).
 */
export function normalizePhone(phone: string): string {
  let digits = phone.replace(/\D/g, "");

  if (digits.startsWith("966")) {
    digits = `0${digits.slice(3)}`;
  }

  if (digits.length === 9 && digits.startsWith("5")) {
    digits = `0${digits}`;
  }

  return digits;
}

export function isValidSaudiMobile(phone: string): boolean {
  return /^05\d{8}$/.test(normalizePhone(phone));
}
