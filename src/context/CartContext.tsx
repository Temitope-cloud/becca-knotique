"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  image?: string;
  price: number; // unit price in NGN
  quantity: number;
  size?: string;
  color?: string;
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
  lineKey: (item: Pick<CartItem, "productId" | "size" | "color">) => string;
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

function makeKey(item: Pick<CartItem, "productId" | "size" | "color">): string {
  return [item.productId, item.size ?? "", item.color ?? ""].join("::");
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [couponCode, setCouponCode] = useState<string | null>(null);
  const [couponDiscount, setCouponDiscount] = useState(0);

  // Load from localStorage once on mount.
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

  // Persist on change (after hydration to avoid clobbering saved cart).
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* ignore quota errors */
    }
  }, [items, hydrated]);

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
