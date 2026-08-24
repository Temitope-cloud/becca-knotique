"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CldUploadWidget } from "next-cloudinary";
import { Check, ShoppingBag, ArrowRight, ImagePlus, X } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatNaira, priceForSize } from "@/lib/money";
import Tooltip from "@/components/ui/Tooltip";
import MeasureGuideButton from "@/components/MeasureGuide";

export interface MeasurementField {
  label: string;
  unit?: string;
  guide?: string;
}

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
  measurementFields?: MeasurementField[];
  allowCustomColor?: boolean;
  inStock?: boolean;
}

// NEXT_PUBLIC_* values are inlined at build time. When absent, the Cloudinary
// widget would throw, so we fall back to letting the customer paste an image URL.
const cloudinaryReady = Boolean(
  process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME &&
    process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
);

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
  blush: "#e8b4b8",
  magenta: "#c026d3",
  fuchsia: "#c026d3",
  burgundy: "#7b1e3a",
  wine: "#7b1e3a",
  coral: "#f97362",
  peach: "#ffb997",
  lavender: "#b57edc",
  mint: "#3eb489",
  beige: "#e3d5b8",
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

/** Resolve every colour named in a combo like "Magenta, Blush & Cream". */
function resolveColors(name?: string): string[] {
  if (!name) return [];
  const parts = name
    .split(/[,/&]|\band\b/i)
    .map((s) => s.trim())
    .filter(Boolean);
  const hexes = parts
    .map((p) => resolveColor(p))
    .filter((x): x is string => Boolean(x));
  if (hexes.length) return Array.from(new Set(hexes));
  const single = resolveColor(name);
  return single ? [single] : [];
}

/** CSS background for a swatch: solid for one colour, a gradient for a combo. */
function swatchBackground(colors: string[]): string | undefined {
  if (colors.length === 0) return undefined;
  if (colors.length === 1) return colors[0];
  const stops = colors
    .map((c, i) => {
      const from = Math.round((i / colors.length) * 100);
      const to = Math.round(((i + 1) / colors.length) * 100);
      return `${c} ${from}% ${to}%`;
    })
    .join(", ");
  return `linear-gradient(135deg, ${stops})`;
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

  const measurementFields = product.measurementFields ?? [];
  const [customFit, setCustomFit] = useState(false);
  const [measurements, setMeasurements] = useState<Record<string, string>>({});
  const [customColor, setCustomColor] = useState("");
  const [referenceImage, setReferenceImage] = useState("");
  const [manualImageUrl, setManualImageUrl] = useState("");

  const soldOut = product.inStock === false;
  const unitPrice = priceForSize(product.price, product.sizePrices, size);
  const discount =
    product.oldPrice && product.oldPrice > unitPrice
      ? Math.round(((product.oldPrice - unitPrice) / product.oldPrice) * 100)
      : null;

  // CTA colour follows the selected colour when it's a single, clear colour.
  // "As pictured" or multi-colour combos keep the brand black to avoid clashing.
  const selectedColors = isAsPictured(color) ? [] : resolveColors(color);
  const ctaBg = selectedColors.length === 1 ? selectedColors[0] : "#111827";
  const bgIsLight = isLight(ctaBg);
  const ctaText = bgIsLight ? "#111827" : "#ffffff";
  // Outlined "Add to cart": a light swatch would be invisible as border+text on
  // white, so fall back to brand black. The filled "Buy now" also gets a subtle
  // border when its fill is light so it stays delineated from the page.
  const outlineColor = bgIsLight ? "#111827" : ctaBg;
  const filledBorder = bgIsLight ? "rgba(0,0,0,0.12)" : ctaBg;

  // Collect filled measurements (with their unit) when custom fit is on.
  const filledMeasurements =
    customFit && measurementFields.length
      ? measurementFields
          .map((f) => {
            const raw = measurements[f.label]?.trim();
            if (!raw) return null;
            const unit = f.unit?.trim() || "cm";
            return { label: f.label, value: `${raw} ${unit}`.trim() };
          })
          .filter((m): m is { label: string; value: string } => Boolean(m))
      : [];

  const trimmedCustomColor = customColor.trim();

  function buildItem() {
    return {
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: product.image,
      price: unitPrice,
      size,
      color,
      measurements: filledMeasurements.length ? filledMeasurements : undefined,
      customColor: trimmedCustomColor || undefined,
      referenceImage: referenceImage || undefined,
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
              const pictured = isAsPictured(c);
              const dotBg = swatchBackground(resolveColors(c));
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
                    ) : dotBg ? (
                      <span
                        className="h-3.5 w-3.5 rounded-full ring-1 ring-black/10"
                        style={{ background: dotBg }}
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

      {measurementFields.length ? (
        <div className="mb-4 rounded-xl border border-stone-200 bg-stone-50/60 p-4">
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={customFit}
              onChange={(e) => setCustomFit(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-stone-300"
            />
            <span className="text-sm">
              <span className="font-medium text-stone-800">
                Made to my measurements
              </span>
              <span className="block text-xs text-stone-500">
                Give us your exact numbers for a custom fit (optional).
              </span>
            </span>
          </label>

          {customFit ? (
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {measurementFields.map((f) => (
                <div key={f.label}>
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <label className="text-xs font-medium text-stone-700">
                      {f.label}
                      {f.unit ? (
                        <span className="text-stone-400"> ({f.unit})</span>
                      ) : null}
                    </label>
                    <MeasureGuideButton guide={f.guide} fieldLabel={f.label} />
                  </div>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={measurements[f.label] ?? ""}
                    onChange={(e) =>
                      setMeasurements((m) => ({
                        ...m,
                        [f.label]: e.target.value,
                      }))
                    }
                    placeholder={`e.g. 92`}
                    className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none transition focus:border-stone-900 focus:ring-2 focus:ring-stone-900/10"
                  />
                </div>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      {product.allowCustomColor ? (
        <div className="mb-4 rounded-xl border border-stone-200 bg-stone-50/60 p-4">
          <p className="text-sm font-medium text-stone-800">
            Want a different colour?
          </p>
          <p className="mt-0.5 text-xs text-stone-500">
            Tell us the colour you&apos;d like, or attach a photo to match.
          </p>
          <input
            type="text"
            value={customColor}
            onChange={(e) => setCustomColor(e.target.value)}
            placeholder="e.g. dusty rose, or 'like the photo I'm attaching'"
            className="mt-3 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none transition focus:border-stone-900 focus:ring-2 focus:ring-stone-900/10"
          />

          <div className="mt-3">
            {referenceImage ? (
              <div className="flex items-center gap-3">
                <div className="relative h-16 w-14 overflow-hidden rounded-lg border border-stone-200 bg-stone-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={referenceImage}
                    alt="Reference"
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setReferenceImage("")}
                    aria-label="Remove reference image"
                    className="absolute top-0.5 right-0.5 rounded-full bg-black/60 p-0.5 text-white"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
                <span className="text-xs text-stone-500">
                  Reference image added
                </span>
              </div>
            ) : cloudinaryReady ? (
              <CldUploadWidget
                signatureEndpoint="/api/cloudinary/sign"
                options={{
                  folder: "beccas-knotique/custom-requests",
                  multiple: false,
                  maxFiles: 1,
                  sources: ["local", "url", "camera"],
                  clientAllowedFormats: ["png", "jpeg", "jpg", "webp"],
                }}
                onSuccess={(result) => {
                  const info = result?.info;
                  if (info && typeof info === "object" && "secure_url" in info) {
                    setReferenceImage((info as { secure_url: string }).secure_url);
                  }
                }}
              >
                {({ open }) => (
                  <button
                    type="button"
                    onClick={() => open()}
                    className="inline-flex items-center gap-2 rounded-lg border-2 border-dashed border-stone-300 px-4 py-2.5 text-sm font-medium text-stone-600 transition hover:border-stone-500 hover:text-stone-800"
                  >
                    <ImagePlus className="h-4 w-4" />
                    Attach a reference photo
                  </button>
                )}
              </CldUploadWidget>
            ) : (
              <div className="flex gap-2">
                <input
                  type="url"
                  value={manualImageUrl}
                  onChange={(e) => setManualImageUrl(e.target.value)}
                  placeholder="Paste an image link"
                  className="min-w-0 flex-1 rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:border-stone-900"
                />
                <button
                  type="button"
                  onClick={() => {
                    const u = manualImageUrl.trim();
                    if (u) setReferenceImage(u);
                    setManualImageUrl("");
                  }}
                  className="shrink-0 rounded-lg border border-stone-900 px-3 py-2 text-sm font-semibold text-stone-900 transition hover:bg-stone-900 hover:text-white"
                >
                  Add
                </button>
              </div>
            )}
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
          style={{ borderColor: outlineColor, color: outlineColor }}
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
          style={{
            backgroundColor: ctaBg,
            color: ctaText,
            borderColor: filledBorder,
          }}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border-2 px-6 py-4 text-sm font-semibold tracking-[0.14em] uppercase transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {soldOut ? "Sold out" : "Buy now"}
          {!soldOut ? <ArrowRight className="h-4 w-4" /> : null}
        </button>
      </div>
    </div>
  );
}
