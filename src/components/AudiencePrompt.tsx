"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";

const KEY = "bk-audience";

/**
 * A small, dismissible, remembered "shopping for?" prompt. Never blocks the
 * page — appears once (until chosen or dismissed), stored in localStorage.
 */
export default function AudiencePrompt() {
  const router = useRouter();
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(KEY)) return;
    } catch {
      return;
    }
    const t = setTimeout(() => setShow(true), 1200);
    return () => clearTimeout(t);
  }, []);

  function remember(value: string) {
    try {
      localStorage.setItem(KEY, value);
    } catch {}
    setShow(false);
  }

  function choose(value: "women" | "men" | "all") {
    remember(value);
    if (value !== "all") router.push(`/products?for=${value}`);
  }

  if (!show) return null;

  const chip =
    "rounded-full border border-stone-300 px-3.5 py-1.5 text-sm font-medium text-stone-700 transition hover:border-stone-900 hover:text-stone-900";

  return (
    <div
      className="bk-audience-prompt fixed bottom-4 left-1/2 z-[200] w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 rounded-2xl border border-stone-200 bg-white p-4 shadow-xl"
      role="dialog"
      aria-label="Shopping for?"
    >
      <button
        type="button"
        onClick={() => remember("dismissed")}
        aria-label="Dismiss"
        className="absolute top-3 right-3 rounded-md p-1 text-stone-400 transition hover:text-stone-700"
      >
        <X className="h-4 w-4" />
      </button>
      <p className="pr-6 text-sm font-semibold text-stone-900">
        Shopping for someone?
      </p>
      <p className="mt-0.5 text-xs text-stone-500">
        We make for everyone — jump straight to what fits.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" onClick={() => choose("women")} className={chip}>
          Women
        </button>
        <button type="button" onClick={() => choose("men")} className={chip}>
          Men
        </button>
        <button type="button" onClick={() => choose("all")} className={chip}>
          Everyone
        </button>
      </div>
      <style>{`
        @keyframes bk-audience-in { from { opacity: 0; transform: translate(-50%, 8px); } to { opacity: 1; transform: translate(-50%, 0); } }
        .bk-audience-prompt { animation: bk-audience-in 0.25s ease-out; }
      `}</style>
    </div>
  );
}
