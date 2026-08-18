/** Format a naira amount for display, e.g. formatNaira(100000) -> "₦100,000" */
export function formatNaira(amount: number): string {
  return `₦${Math.round(amount).toLocaleString("en-NG")}`;
}

/** Paystack expects amounts in kobo (1 naira = 100 kobo). */
export function nairaToKobo(naira: number): number {
  return Math.round(naira * 100);
}
