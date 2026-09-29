"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useSession } from "next-auth/react";

export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  image?: string;
  price: number; // unit price in NGN
  quantity: number;
  size?: string;
  color?: string;
  /** Made-to-measure values the customer supplied, e.g. Bust = 92cm. */
  measurements?: { label: string; value: string }[];
  /** Free-text custom colour request. */
  customColor?: string;
  /** URL of an uploaded reference image. */
  referenceImage?: string;
  madeToOrder?: boolean;
  leadTime?: string;
}

export interface AppliedCoupon {
  code: string;
  discount: number;
}

interface CartContextValue {
  items: CartItem[];
  count: number;
  subtotal: number;
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (key: string) => void;
  updateQuantity: (key: string, quantity: number) => void;
  clearCart: () => void;
  /** Unique key for a line (product + variant). */
  lineKey: (
    item: Pick<
      CartItem,
      | "productId"
      | "size"
      | "color"
      | "measurements"
      | "customColor"
      | "referenceImage"
    >,
  ) => string;
  hydrated: boolean;
  // Coupon (applied on the cart page, carried through to checkout)
  coupon: AppliedCoupon | null;
  applyCoupon: (code: string) => Promise<{ ok: boolean; reason?: string }>;
  removeCoupon: () => void;
  /** subtotal minus coupon discount (shipping is added at checkout) */
  total: number;
}

const STORAGE_KEY = "bk-cart";
const COUPON_KEY = "bk-coupon";

const CartContext = createContext<CartContextValue | null>(null);

/** Signature for the custom (made-to-measure / custom colour) part of a line. */
function variantSig(
  item: Pick<CartItem, "measurements" | "customColor" | "referenceImage">,
): string {
  const m = item.measurements?.length
    ? item.measurements.map((x) => `${x.label}=${x.value}`).join("|")
    : "";
  return [item.customColor ?? "", item.referenceImage ?? "", m].join("~");
}

function makeKey(
  item: Pick<
    CartItem,
    | "productId"
    | "size"
    | "color"
    | "measurements"
    | "customColor"
    | "referenceImage"
  >,
): string {
  return [
    item.productId,
    item.size ?? "",
    item.color ?? "",
    variantSig(item),
  ].join("::");
}

function mergeCartItems(saved: CartItem[], local: CartItem[]): CartItem[] {
  const merged = [...saved];
  for (const item of local) {
    const index = merged.findIndex((existing) => makeKey(existing) === makeKey(item));
    if (index >= 0) merged[index] = { ...merged[index], quantity: Math.min(50, merged[index].quantity + item.quantity) };
    else merged.push(item);
  }
  return merged;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [couponCode, setCouponCode] = useState<string | null>(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [databaseReady, setDatabaseReady] = useState(false);
  const itemsRef = useRef<CartItem[]>([]);
  const syncedUserRef = useRef<string | null>(null);
  const wasSignedInRef = useRef(false);
  const { data: session, status } = useSession();

  useEffect(() => { itemsRef.current = items; }, [items]);

  // Load a temporary guest cart once on mount. Authenticated carts are loaded
  // from the database and any guest items are merged after sign-in.

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setItems(parsed);
      }
      const savedCoupon = localStorage.getItem(COUPON_KEY);
      if (savedCoupon) setCouponCode(savedCoupon);
    } catch {
      /* ignore corrupt storage */
    }
    setHydrated(true);
  }, []);

  // Guests keep a temporary cart locally. A signed-in customer's cart lives in
  // their account so it follows them to another device.
  useEffect(() => {
    if (!hydrated || status === "loading" || status === "authenticated") return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch { /* ignore quota errors */ }
  }, [items, hydrated, status]);

  useEffect(() => {
    const userId = session?.user?.id;
    if (!hydrated || status !== "authenticated" || !userId || syncedUserRef.current === userId) return;
    let cancelled = false;
    fetch("/api/account/cart")
      .then((response) => {
        if (!response.ok) throw new Error("Could not load saved cart.");
        return response.json();
      })
      .then(async (data) => {
        if (cancelled) return;
        const saved = Array.isArray(data.items) ? data.items as CartItem[] : [];
        const merged = mergeCartItems(saved, itemsRef.current);
        itemsRef.current = merged;
        setItems(merged);
        syncedUserRef.current = userId;
        setDatabaseReady(true);
        localStorage.removeItem(STORAGE_KEY);
        await fetch("/api/account/cart", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ items: merged }) });
      })
      .catch(() => {
        if (!cancelled) {
          // Keep a local fallback if the database is temporarily unavailable.
          try { localStorage.setItem(STORAGE_KEY, JSON.stringify(itemsRef.current)); } catch { /* ignore quota errors */ }
          syncedUserRef.current = userId;
          setDatabaseReady(false);
        }
      });
    return () => { cancelled = true; };
  }, [hydrated, session?.user?.id, status]);

  useEffect(() => {
    if (!hydrated || status !== "authenticated" || !databaseReady) return;
    const timer = window.setTimeout(() => {
      fetch("/api/account/cart", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ items }) }).catch(() => {});
    }, 300);
    return () => window.clearTimeout(timer);
  }, [items, hydrated, status, databaseReady]);

  useEffect(() => {
    if (status === "authenticated") { wasSignedInRef.current = true; return; }
    if (status === "unauthenticated" && wasSignedInRef.current) {
      wasSignedInRef.current = false;
      syncedUserRef.current = null;
      setDatabaseReady(false);
      setItems([]);
    }
  }, [status]);

  const addItem = useCallback(
    (item: Omit<CartItem, "quantity">, quantity = 1) => {
      setItems((prev) => {
        const key = makeKey(item);
        const idx = prev.findIndex((p) => makeKey(p) === key);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = {
            ...next[idx],
            quantity: next[idx].quantity + quantity,
          };
          return next;
        }
        return [...prev, { ...item, quantity }];
      });
    },
    [],
  );

  const removeItem = useCallback((key: string) => {
    setItems((prev) => prev.filter((p) => makeKey(p) !== key));
  }, []);

  const updateQuantity = useCallback((key: string, quantity: number) => {
    setItems((prev) =>
      prev
        .map((p) =>
          makeKey(p) === key ? { ...p, quantity: Math.max(0, quantity) } : p,
        )
        .filter((p) => p.quantity > 0),
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    setCouponCode(null);
    setCouponDiscount(0);
  }, []);

  const count = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity, 0),
    [items],
  );
  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    [items],
  );

  // Persist the applied coupon code.
  useEffect(() => {
    if (!hydrated) return;
    try {
      if (couponCode) localStorage.setItem(COUPON_KEY, couponCode);
      else localStorage.removeItem(COUPON_KEY);
    } catch {
      /* ignore */
    }
  }, [couponCode, hydrated]);

  const applyCoupon = useCallback(
    async (code: string): Promise<{ ok: boolean; reason?: string }> => {
      const trimmed = code.trim().toUpperCase();
      if (!trimmed) return { ok: false, reason: "Enter a code." };
      try {
        const res = await fetch("/api/coupons/validate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: trimmed, subtotal }),
        });
        const data = await res.json();
        if (data.valid) {
          setCouponCode(data.code || trimmed);
          setCouponDiscount(data.discount || 0);
          return { ok: true };
        }
        setCouponCode(null);
        setCouponDiscount(0);
        return { ok: false, reason: data.reason || "Invalid code." };
      } catch {
        return { ok: false, reason: "Could not check that code." };
      }
    },
    [subtotal],
  );

  const removeCoupon = useCallback(() => {
    setCouponCode(null);
    setCouponDiscount(0);
  }, []);

  // Re-validate the applied coupon whenever the cart total changes (percentage
  // coupons scale, and a coupon can become invalid if the minimum is no longer met).
  useEffect(() => {
    if (!hydrated || !couponCode) return;
    let cancelled = false;
    fetch("/api/coupons/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: couponCode, subtotal }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return;
        if (d.valid) {
          setCouponDiscount(d.discount || 0);
        } else {
          setCouponCode(null);
          setCouponDiscount(0);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [subtotal, couponCode, hydrated]);

  const coupon = useMemo<AppliedCoupon | null>(
    () => (couponCode ? { code: couponCode, discount: couponDiscount } : null),
    [couponCode, couponDiscount],
  );
  const total = useMemo(
    () => Math.max(0, subtotal - couponDiscount),
    [subtotal, couponDiscount],
  );

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      count,
      subtotal,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      lineKey: makeKey,
      hydrated,
      coupon,
      applyCoupon,
      removeCoupon,
      total,
    }),
    [
      items,
      count,
      subtotal,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      hydrated,
      coupon,
      applyCoupon,
      removeCoupon,
      total,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return ctx;
}
