"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Smile } from "lucide-react";
import {
  PRODUCT_VIEWS_STORAGE_KEY,
  readProductViews,
} from "@/lib/product-views";

const MIN_VISITS = 4;

/** Short, chill lines; pick varies a bit by product slug and visit count. */
function pickLine(slug: string, count: number): string {
  const linesLow = [
    (n: number) =>
      `Seems you're lowkey obsessed with this piece 🤭 Add it to your cart when you're ready.`,
    (n: number) =>
      `${n} visits in and we're not even mad 👀 It's right here whenever you're ready.`,
    (n: number) =>
      `You really like this one, huh? We'd love to make it yours 😄`,
    (n: number) =>
      `This page knows you by name now 🤭 No pressure, order when it feels right.`,
    (n: number) =>
      `The way you keep coming back… we respect it 💚`,
    (n: number) =>
      `Lowkey crushing on this fit? Same. Add to cart when you're ready 💚`,
  ];
  const linesHigh = [
    (n: number) =>
      `${n} peeks?! Okay champion 🤭 You've earned it — add it to your cart.`,
    (n: number) =>
      `At this point you and this piece are in a situationship 😄 Make it official?`,
  ];

  const pool = count >= 10 ? [...linesLow, ...linesHigh] : linesLow;
  let h = 0;
  for (let i = 0; i < slug.length; i++)
    h = (h + slug.charCodeAt(i) * (i + 1)) % 997;
  const idx = (h + count) % pool.length;
  return pool[idx](count);
}

type ProductRevisitNudgeProps = {
  slug: string;
};

export default function ProductRevisitNudge({
  slug,
}: ProductRevisitNudgeProps) {
  const [count, setCount] = useState(0);

  const refresh = useCallback(() => {
    if (typeof window === "undefined" || !slug) return;
    const n = readProductViews()[slug] ?? 0;
    setCount(n);
  }, [slug]);

  useEffect(() => {
    refresh();
    const onViews = () => refresh();
    window.addEventListener("bk-product-views-changed", onViews);
    const onStorage = (e: StorageEvent) => {
      if (e.key === null || e.key === PRODUCT_VIEWS_STORAGE_KEY) refresh();
    };
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("bk-product-views-changed", onViews);
      window.removeEventListener("storage", onStorage);
    };
  }, [refresh]);

  const line = useMemo(
    () => (count >= MIN_VISITS ? pickLine(slug, count) : ""),
    [slug, count],
  );

  if (!line || count < MIN_VISITS) return null;

  return (
    <div className="mt-6 rounded-2xl border border-emerald-200/70 bg-linear-to-br from-emerald-50/90 to-white p-4 sm:p-5">
      <div className="flex gap-3 sm:gap-4">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/70 text-emerald-800 shadow-sm ring-1 ring-emerald-200/60"
          aria-hidden
        >
          <Smile className="h-5 w-5" strokeWidth={1.75} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-medium text-stone-800 sm:text-sm">
            Between us
          </p>
          <p className="mt-1.5 text-sm leading-relaxed text-stone-600">
            {line}
          </p>
        </div>
      </div>
    </div>
  );
}
