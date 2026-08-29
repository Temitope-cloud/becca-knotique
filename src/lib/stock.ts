/**
 * Shared, dependency-free stock rules. Safe to import from both client
 * components and server code (no "server-only" here).
 */

export interface StockLike {
  inStock?: boolean;
  stockCount?: number;
  madeToOrder?: boolean;
}

/**
 * A ready-made product is sold out when it's flagged out of stock or has no
 * units left. Made-to-order pieces are crocheted per order, so they never
 * sell out. When stockCount isn't tracked (undefined), only the inStock flag
 * decides.
 */
export function isSoldOut(p: StockLike): boolean {
  if (p.madeToOrder) return false;
  if (p.inStock === false) return true;
  return typeof p.stockCount === "number" && p.stockCount <= 0;
}

/**
 * Units a shopper can buy right now. `null` means "not limited" — either the
 * item is made to order, or its stock isn't tracked.
 */
export function unitsLeft(p: StockLike): number | null {
  if (p.madeToOrder) return null;
  if (typeof p.stockCount !== "number") return null;
  return Math.max(0, p.stockCount);
}

/** Whether `quantity` of this product can be fulfilled right now. */
export function canFulfill(p: StockLike, quantity: number): boolean {
  if (isSoldOut(p)) return false;
  const left = unitsLeft(p);
  return left === null || quantity <= left;
}
