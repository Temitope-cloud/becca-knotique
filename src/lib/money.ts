/** Format a naira amount for display, e.g. formatNaira(100000) -> "₦100,000" */
export function formatNaira(amount: number): string {
  return `₦${Math.round(amount).toLocaleString("en-NG")}`;
}

/** Paystack expects amounts in kobo (1 naira = 100 kobo). */
export function nairaToKobo(naira: number): number {
  return Math.round(naira * 100);
}

/** Resolve a product's unit price for a chosen size (falls back to base price). */
export function priceForSize(
  basePrice: number,
  sizePrices: { size: string; price: number }[] | undefined,
  size: string | undefined,
): number {
  if (!size || !sizePrices?.length) return basePrice;
  const match = sizePrices.find((sp) => sp.size === size);
  return match && typeof match.price === "number" ? match.price : basePrice;
}

/** Resolve a product's unit material cost for a chosen size (falls back to base). */
export function materialCostForSize(
  baseCost: number,
  sizeMaterialCosts: { size: string; cost: number }[] | undefined,
  size: string | undefined,
): number {
  if (!size || !sizeMaterialCosts?.length) return baseCost;
  const match = sizeMaterialCosts.find((sc) => sc.size === size);
  return match && typeof match.cost === "number" ? match.cost : baseCost;
}
