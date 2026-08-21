"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Check, ShoppingBag, ArrowRight } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatNaira, priceForSize } from "@/lib/money";
import Tooltip from "@/components/ui/Tooltip";

export interface PurchaseProduct {
  id: string;
  slug: string;
  name: string;
  price: number;
  oldPrice?: number;
  sizePrices?: { size: string; price: number }[];
  image?: string;
  sizes?: string[];
  colors?: string[];
  inStock?: boolean;
}

/** Map a colour name to a usable swatch. Returns null when we can't tell. */
const COLOR_MAP: Record<string, string> = {
  cream: "#e7dcc4",
  ivory: "#f3ead7",
  white: "#f5f5f5",
  black: "#111827",
  green: "#059669",
  emerald: "#059669",
  forest: "#065f46",
  sage: "#9caf88",
  olive: "#6b7d3a",
  mocha: "#7b5e46",
  brown: "#6b4f3a",
  earth: "#8a6d4f",
  tan: "#d2b48c",
  camel: "#c19a6b",
  sunset: "#e08a5b",
  rust: "#b45309",
  mustard: "#d4a017",
  gold: "#c9a227",
  terracotta: "#c56b4a",
  rose: "#e11d48",
  pink: "#ec4899",
  lilac: "#b57edc",
  purple: "#7c3aed",
  blue: "#2563eb",
  navy: "#1e3a5f",
  teal: "#0d9488",
  grey: "#6b7280",
  gray: "#6b7280",
  charcoal: "#374151",
  stone: "#78716c",
  red: "#dc2626",
  yellow: "#eab308",
  orange: "#ea580c",
};

function resolveColor(name?: string): string | null {
  if (!name) return null;
  const key = name.toLowerCase();
  if (COLOR_MAP[key]) return COLOR_MAP[key];
  for (const k of Object.keys(COLOR_MAP)) {
    if (key.includes(k)) return COLOR_MAP[k];
  }
  return null;
}

/** "As pictured" / "As shown in the image" style options use the photo itself. */
function isAsPictured(name?: string): boolean {
  if (!name) return false;
  const k = name.toLowerCase();
  return (
    k === "as it is" ||
    [
      "as pictured",
      "as shown",
      "as in image",
      "as in the image",
      "as it is in the image",
      "as displayed",
      "as seen",
      "as photographed",
      "picture colour",
      "picture color",
      "image colour",
      "image color",
    ].some((p) => k.includes(p))
  );
}

function isLight(hex: string): boolean {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  // relative luminance
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.62;
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
  const unitPrice = priceForSize(product.price, product.sizePrices, size);
  const discount =
    product.oldPrice && product.oldPrice > unitPrice
      ? Math.round(((product.oldPrice - unitPrice) / product.oldPrice) * 100)
      : null;

  // CTA colour follows the selected colour (falls back to brand black).
  // "As pictured" has no single colour, so keep the brand black.
  const swatch = isAsPictured(color) ? null : resolveColor(color);
  const ctaBg = swatch ?? "#111827";
  const ctaText = isLight(ctaBg) ? "#111827" : "#ffffff";

  function buildItem() {
    return {
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: product.image,
      price: unitPrice,
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
    <div className="mt-6">
      {/* reactive price */}
      <div className="mb-6 flex flex-wrap items-baseline gap-3">
        <span className="text-4xl font-semibold tracking-tight text-stone-900">
          {formatNaira(unitPrice)}
        </span>
        {product.oldPrice && product.oldPrice > unitPrice ? (
          <span className="text-xl text-stone-400 line-through">
            {formatNaira(product.oldPrice)}
          </span>
        ) : null}
        {discount ? (
          <span className="rounded-full bg-emerald-700/10 px-3 py-1 text-xs font-semibold tracking-wide text-emerald-800 uppercase">
            Save {discount}%
          </span>
        ) : null}
      </div>

      {product.sizes?.length ? (
        <div className="mb-4">
          <p className="mb-2 text-sm font-medium text-stone-700">Size</p>
          <div className="flex flex-wrap gap-2">
            {product.sizes.map((s) => {
              const sp = product.sizePrices?.find((x) => x.size === s);
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSize(s)}
                  className={`flex min-w-11 flex-col items-center rounded-lg border px-3 py-2 text-sm font-medium transition ${
                    size === s
                      ? "border-stone-900 bg-stone-900 text-white"
                      : "border-stone-300 text-stone-700 hover:border-stone-500"
                  }`}
                >
                  {s}
                  {sp ? (
                    <span
                      className={`text-[10px] ${size === s ? "text-white/70" : "text-stone-400"}`}
                    >
                      {formatNaira(sp.price)}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      {product.colors?.length ? (
        <div className="mb-4">
          <p className="mb-2 text-sm font-medium text-stone-700">Color</p>
          <div className="flex flex-wrap gap-2">
            {product.colors.map((c) => {
              const dot = resolveColor(c);
              const pictured = isAsPictured(c);
              return (
                <Tooltip
                  key={c}
                  label={
                    pictured ? "Colour exactly as shown in the photos" : c
                  }
                >
                  <button
                    type="button"
                    onClick={() => setColor(c)}
                    className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium capitalize transition ${
                      color === c
                        ? "border-stone-900 bg-stone-900 text-white"
                        : "border-stone-300 text-stone-700 hover:border-stone-500"
                    }`}
                  >
                    {pictured && product.image ? (
                      <span className="h-4 w-4 overflow-hidden rounded-full ring-1 ring-black/10">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={product.image}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      </span>
                    ) : dot ? (
                      <span
                        className="h-3.5 w-3.5 rounded-full ring-1 ring-black/10"
                        style={{ backgroundColor: dot }}
                      />
                    ) : null}
                    {c}
                  </button>
                </Tooltip>
              );
            })}
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
          style={{ borderColor: ctaBg, color: ctaBg }}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border-2 bg-white px-6 py-4 text-sm font-semibold tracking-[0.14em] uppercase transition hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-50"
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
          style={{ backgroundColor: ctaBg, color: ctaText }}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-6 py-4 text-sm font-semibold tracking-[0.14em] uppercase transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {soldOut ? "Sold out" : "Buy now"}
          {!soldOut ? <ArrowRight className="h-4 w-4" /> : null}
        </button>
      </div>
    </div>
  );
}
