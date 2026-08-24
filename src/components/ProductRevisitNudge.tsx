"use client";

import { useCallback, useEffect, useState } from "react";
import { Smile, X } from "lucide-react";
import { IconBrandWhatsapp } from "@tabler/icons-react";
import {
  PRODUCT_VIEWS_STORAGE_KEY,
  readProductViews,
} from "@/lib/product-views";

const MIN_VISITS = 4;
const DISMISS_KEY = "bk-nudge-dismissed";
const WHATSAPP_PHONE = "2348029086678";

// Plain, friendly lines. One is chosen per product and stays the same on refresh.
const LINES = [
  "You have looked at this piece a few times. Do you have any questions before you order?",
  "Still deciding on this one? We are happy to help you choose.",
  "You keep coming back to this piece. Ask us anything about it.",
  "Love this one? Tell us your size and colour and we will make it for you.",
];

function pickLine(slug: string): string {
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h + slug.charCodeAt(i)) % 9973;
  return LINES[h % LINES.length];
}

function readDismissed(): string[] {
  try {
    const raw = localStorage.getItem(DISMISS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function ProductRevisitNudge({
  slug,
  productName,
}: {
  slug: string;
  productName?: string;
}) {
  const [count, setCount] = useState(0);
  const [dismissed, setDismissed] = useState(true); // hidden until we check

  const refresh = useCallback(() => {
    if (typeof window === "undefined" || !slug) return;
    setCount(readProductViews()[slug] ?? 0);
  }, [slug]);

  useEffect(() => {
    setDismissed(readDismissed().includes(slug));
    refresh();
    const onViews = () => refresh();
    const onStorage = (e: StorageEvent) => {
      if (e.key === null || e.key === PRODUCT_VIEWS_STORAGE_KEY) refresh();
    };
    window.addEventListener("bk-product-views-changed", onViews);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("bk-product-views-changed", onViews);
      window.removeEventListener("storage", onStorage);
    };
  }, [slug, refresh]);

  function dismiss() {
    setDismissed(true);
    try {
      const list = readDismissed();
      if (!list.includes(slug)) {
        localStorage.setItem(DISMISS_KEY, JSON.stringify([...list, slug]));
      }
    } catch {
      /* ignore */
    }
  }

  if (dismissed || count < MIN_VISITS) return null;

  const message = productName
    ? `Hi Becca's Knotique! I have a question about the ${productName}. Can you help me with the fit and delivery?`
    : "Hi Becca's Knotique! I have a question about a piece on your site. Can you help me with the fit and delivery?";
  const whatsappUrl = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`;

  return (
    <div className="relative mt-6 rounded-2xl border border-emerald-200/70 bg-linear-to-br from-emerald-50/90 to-white p-4 sm:p-5">
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss"
        className="absolute top-3 right-3 rounded-md p-1 text-stone-400 transition hover:bg-stone-100 hover:text-stone-700"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="flex gap-3 pr-6 sm:gap-4">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/70 text-emerald-800 shadow-sm ring-1 ring-emerald-200/60"
          aria-hidden
        >
          <Smile className="h-5 w-5" strokeWidth={1.75} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-semibold text-stone-800 sm:text-sm">
            Between us
          </p>
          <p className="mt-1 text-sm leading-relaxed text-stone-600">
            {pickLine(slug)}
          </p>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-2 rounded-full bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800"
          >
            <IconBrandWhatsapp className="h-4 w-4" />
            Chat about fit or delivery
          </a>
        </div>
      </div>
    </div>
  );
}
