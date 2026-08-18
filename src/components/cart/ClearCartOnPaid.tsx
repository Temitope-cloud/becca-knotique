"use client";

import { useEffect } from "react";
import { useCart } from "@/context/CartContext";

/** Empties the cart once, when an order is confirmed paid. */
export default function ClearCartOnPaid({ active }: { active: boolean }) {
  const { clearCart, hydrated } = useCart();
  useEffect(() => {
    if (active && hydrated) clearCart();
  }, [active, hydrated, clearCart]);
  return null;
}
