"use client";

import { useEffect } from "react";
import { incrementProductView } from "@/lib/product-views";

const DEBOUNCE_MS = 3200;

type ProductViewTrackerProps = {
  slug: string;
};

/**
 * Records a product page view in localStorage (per device).
 * Debounces rapid remounts (e.g. React Strict Mode) so a single visit counts once.
 */
export default function ProductViewTracker({ slug }: ProductViewTrackerProps) {
  useEffect(() => {
    if (!slug || typeof window === "undefined") return;
    const key = `bk_pv_debounce_${slug}`;
    const prev = sessionStorage.getItem(key);
    const now = Date.now();
    if (prev !== null && now - Number(prev) < DEBOUNCE_MS) return;
    sessionStorage.setItem(key, String(now));
    incrementProductView(slug);
    window.dispatchEvent(new Event("bk-product-views-changed"));
  }, [slug]);

  return null;
}
