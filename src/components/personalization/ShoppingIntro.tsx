"use client";

import { useEffect, useRef } from "react";
import { motion } from "motion/react";
import { useShoppingPreference } from "@/context/ShoppingPreferenceContext";
import type { ShoppingPreference } from "@/lib/audience";

export default function ShoppingIntro() {
  const { preference, setPreference } = useShoppingPreference();
  const ref = useRef<HTMLDivElement>(null);

  const open = preference === null;

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    // Move focus into the entrance for keyboard/screen-reader users.
    const first = ref.current?.querySelector<HTMLButtonElement>("button");
    first?.focus();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setPreference("all"); // skipping = show everything, never traps
        return;
      }
      if (e.key !== "Tab" || !ref.current) return;
      const items = Array.from(
        ref.current.querySelectorAll<HTMLButtonElement>("button"),
      );
      if (items.length === 0) return;
      const firstEl = items[0];
      const lastEl = items[items.length - 1];
      if (e.shiftKey && document.activeElement === firstEl) {
        e.preventDefault();
        lastEl.focus();
      } else if (!e.shiftKey && document.activeElement === lastEl) {
        e.preventDefault();
        firstEl.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, setPreference]);

  if (!open) return null;

  const choose = (p: ShoppingPreference) => () => setPreference(p);

  return (
    <div
      className="fixed inset-0 z-[400] flex items-center justify-center overflow-y-auto bg-[#faf8f5] px-6 py-16"
      role="dialog"
      aria-modal="true"
      aria-labelledby="intro-heading"
    >
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-2xl text-center"
      >
        <p className="font-apparel text-sm tracking-[0.32em] text-stone-500 uppercase">
          Becca&apos;s Knotique
        </p>
        <p className="mt-6 text-[11px] tracking-[0.3em] text-emerald-700 uppercase">
          Crochet made personal
        </p>
        <h1
          id="intro-heading"
          className="font-apparel mt-4 text-4xl leading-[1.05] tracking-tight text-stone-900 sm:text-6xl"
        >
          Who are you shopping for?
        </h1>

        <div className="mx-auto mt-12 flex w-full max-w-md flex-col gap-3">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={choose("her")}
              className="flex-1 border border-stone-300 py-5 text-sm font-medium tracking-[0.18em] text-stone-900 uppercase transition hover:border-stone-900 hover:bg-white focus-visible:ring-2 focus-visible:ring-stone-900 focus-visible:outline-none"
            >
              For Her
            </button>
            <button
              type="button"
              onClick={choose("him")}
              className="flex-1 border border-stone-300 py-5 text-sm font-medium tracking-[0.18em] text-stone-900 uppercase transition hover:border-stone-900 hover:bg-white focus-visible:ring-2 focus-visible:ring-stone-900 focus-visible:outline-none"
            >
              For Him
            </button>
          </div>
          <button
            type="button"
            onClick={choose("all")}
            className="w-full py-3 text-sm font-medium tracking-[0.14em] text-stone-700 underline decoration-stone-300 underline-offset-[6px] transition hover:text-stone-900 hover:decoration-stone-900 focus-visible:ring-2 focus-visible:ring-stone-900 focus-visible:outline-none"
          >
            Shop Everything
          </button>
        </div>

        <button
          type="button"
          onClick={choose("gift")}
          className="mt-8 text-xs tracking-[0.12em] text-stone-500 uppercase transition hover:text-stone-800 focus-visible:ring-2 focus-visible:ring-stone-900 focus-visible:outline-none"
        >
          I&apos;m shopping for a gift
        </button>
      </motion.div>
    </div>
  );
}
