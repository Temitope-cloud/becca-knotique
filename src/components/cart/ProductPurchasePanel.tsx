"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Check, ShoppingBag, ArrowRight } from "lucide-react";
import { useCart } from "@/context/CartContext";

export interface PurchaseProduct {
  id: string;
  slug: string;
  name: string;
  price: number;
  image?: string;
  sizes?: string[];
  colors?: string[];
  inStock?: boolean;
}

export default function ProductPurchasePanel({
  product,
}: {
  product: PurchaseProduct;
}) {
  const router = useRouter();
  const { addItem } = useCart();

  const [size, setSize] = useState<string | undefined>(product.sizes?.[0]);
  const [color, setColor] = useState<string | undefined>(product.colors?.[0]);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const soldOut = product.inStock === false;

  function buildItem() {
    return {
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: product.image,
      price: product.price,
      size,
      color,
    };
  }

  function handleAdd() {
    addItem(buildItem(), quantity);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
  }

  function handleBuyNow() {
    addItem(buildItem(), quantity);
    router.push("/checkout");
  }

  return (
    <div className="mt-7">
      {product.sizes?.length ? (
        <div className="mb-4">
          <p className="mb-2 text-sm font-medium text-stone-700">Size</p>
          <div className="flex flex-wrap gap-2">
            {product.sizes.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSize(s)}
                className={`min-w-11 rounded-lg border px-3 py-2 text-sm font-medium transition ${
                  size === s
                    ? "border-stone-900 bg-stone-900 text-white"
                    : "border-stone-300 text-stone-700 hover:border-stone-500"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {product.colors?.length ? (
        <div className="mb-4">
          <p className="mb-2 text-sm font-medium text-stone-700">Color</p>
          <div className="flex flex-wrap gap-2">
            {product.colors.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`rounded-lg border px-3 py-2 text-sm font-medium capitalize transition ${
                  color === c
                    ? "border-stone-900 bg-stone-900 text-white"
                    : "border-stone-300 text-stone-700 hover:border-stone-500"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div className="mb-5 flex items-center gap-4">
        <p className="text-sm font-medium text-stone-700">Quantity</p>
        <div className="inline-flex items-center rounded-lg border border-stone-300">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="px-3 py-2 text-lg leading-none text-stone-700 hover:bg-stone-100"
            aria-label="Decrease quantity"
          >
            −
          </button>
          <span className="w-10 text-center text-sm font-semibold text-stone-900">
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.min(20, q + 1))}
            className="px-3 py-2 text-lg leading-none text-stone-700 hover:bg-stone-100"
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={handleAdd}
          disabled={soldOut}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-stone-900 bg-white px-6 py-4 text-sm font-semibold tracking-[0.14em] text-stone-900 uppercase transition hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {added ? (
            <>
              <Check className="h-4 w-4" /> Added
            </>
          ) : (
            <>
              <ShoppingBag className="h-4 w-4" /> Add to cart
            </>
          )}
        </button>
        <button
          type="button"
          onClick={handleBuyNow}
          disabled={soldOut}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-stone-900 px-6 py-4 text-sm font-semibold tracking-[0.14em] text-white uppercase transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {soldOut ? "Sold out" : "Buy now"}
          {!soldOut ? <ArrowRight className="h-4 w-4" /> : null}
        </button>
      </div>

      {/* ── v1 fallback: order via WhatsApp (kept for reference, see src/lib/utils.ts getWhatsAppLink) ──
      <a href={getWhatsAppLink(product)} target="_blank" className="...">
        Order on WhatsApp
      </a>
      */}
    </div>
  );
}
