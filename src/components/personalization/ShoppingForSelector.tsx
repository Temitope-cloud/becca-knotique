"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { useShoppingPreference } from "@/context/ShoppingPreferenceContext";
import { labelFor, type ShoppingPreference } from "@/lib/audience";

const OPTIONS: { value: ShoppingPreference; label: string }[] = [
  { value: "her", label: "For Her" },
  { value: "him", label: "For Him" },
  { value: "all", label: "Shop Everything" },
  { value: "gift", label: "A gift" },
];

export default function ShoppingForSelector({
  className = "",
}: {
  className?: string;
}) {
  const { preference, setPreference } = useShoppingPreference();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="inline-flex items-center gap-1 text-[11px] tracking-[0.14em] text-current/70 uppercase transition hover:text-current focus-visible:ring-2 focus-visible:ring-current/40 focus-visible:outline-none"
      >
        Shopping for: {labelFor(preference ?? "all")}
        <ChevronDown
          className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-44 overflow-hidden rounded-xl border border-stone-200 bg-white py-1 text-left shadow-xl"
        >
          {OPTIONS.map((o) => {
            const active = (preference ?? "all") === o.value;
            return (
              <button
                key={o.value}
                type="button"
                role="menuitem"
                onClick={() => {
                  setPreference(o.value);
                  setOpen(false);
                }}
                className={`block w-full px-4 py-2 text-left text-sm transition hover:bg-stone-50 ${
                  active ? "font-semibold text-stone-900" : "text-stone-600"
                }`}
              >
                {o.label}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
