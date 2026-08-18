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
}

const STORAGE_KEY = "bk-cart";

const CartContext = createContext<CartContextValue | null>(null);

function makeKey(item: Pick<CartItem, "productId" | "size" | "color">): string {
  return [item.productId, item.size ?? "", item.color ?? ""].join("::");
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Load from localStorage once on mount.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setItems(parsed);
      }
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

  const clearCart = useCallback(() => setItems([]), []);

  const count = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity, 0),
    [items],
  );
  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    [items],
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
