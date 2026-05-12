export const PRODUCT_VIEWS_STORAGE_KEY = "bk_product_views_v1";

export type ProductViewsMap = Record<string, number>;

export function parseProductViews(raw: string | null): ProductViewsMap {
  if (!raw) return {};
  try {
    const data = JSON.parse(raw) as unknown;
    if (typeof data !== "object" || data === null || Array.isArray(data)) {
      return {};
    }
    const out: ProductViewsMap = {};
    for (const [k, v] of Object.entries(data)) {
      if (typeof k === "string" && typeof v === "number" && Number.isFinite(v)) {
        out[k] = Math.max(0, Math.floor(v));
      }
    }
    return out;
  } catch {
    return {};
  }
}

export function readProductViews(): ProductViewsMap {
  if (typeof window === "undefined") return {};
  return parseProductViews(localStorage.getItem(PRODUCT_VIEWS_STORAGE_KEY));
}

export function writeProductViews(map: ProductViewsMap): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(PRODUCT_VIEWS_STORAGE_KEY, JSON.stringify(map));
}

export function incrementProductView(slug: string): void {
  if (typeof window === "undefined" || !slug) return;
  const map = readProductViews();
  map[slug] = (map[slug] ?? 0) + 1;
  writeProductViews(map);
}
