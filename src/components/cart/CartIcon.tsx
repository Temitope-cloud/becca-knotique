"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function CartIcon({
  className = "",
}: {
  className?: string;
}) {
  const { count, hydrated } = useCart();

  return (
    <Link
      href="/cart"
      aria-label={`Cart${hydrated && count ? ` (${count} items)` : ""}`}
      className={`relative inline-flex items-center justify-center ${className}`}
    >
      <ShoppingBag className="h-6 w-6" />
      {hydrated && count > 0 ? (
        <span className="absolute -top-2 -right-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#e3948e] px-1 text-[11px] font-bold text-stone-900">
          {count > 99 ? "99+" : count}
        </span>
      ) : null}
    </Link>
  );
}
