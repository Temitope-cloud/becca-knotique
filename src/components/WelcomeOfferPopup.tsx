"use client";

import Image from "next/image";
import { X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const DISMISSED_KEY = "bk-welcome-offer-dismissed";

export default function WelcomeOfferPopup() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (pathname.startsWith("/admin") || pathname.startsWith("/checkout") || localStorage.getItem(DISMISSED_KEY)) return;
    const timer = window.setTimeout(() => setOpen(true), 900);
    return () => window.clearTimeout(timer);
  }, [pathname]);

  function close(remember = true) {
    if (remember) localStorage.setItem(DISMISSED_KEY, "true");
    setOpen(false);
  }

  async function subscribe(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    const response = await fetch("/api/newsletter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, consent }),
    });
    const data = await response.json();
    setSaving(false);
    if (!response.ok) {
      setMessage(data.error || "Could not subscribe right now.");
      return;
    }
    setMessage("You are on the list. Use the welcome offer that matches your cart.");
    localStorage.setItem(DISMISSED_KEY, "true");
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/55 p-4" role="dialog" aria-modal="true" aria-labelledby="welcome-offer-title">
      <section className="relative grid w-full max-w-2xl overflow-hidden bg-white shadow-2xl md:grid-cols-[1.1fr_0.9fr]">
        <button type="button" onClick={() => close()} className="absolute top-3 left-3 z-10 rounded-full p-1 text-stone-950 transition hover:bg-stone-100" aria-label="Close welcome offer">
          <X className="size-5" />
        </button>
        <div className="p-6 pt-14 sm:p-8 sm:pt-14">
          <h2 id="welcome-offer-title" className="text-2xl font-semibold leading-tight tracking-tight text-stone-950 uppercase">Welcome savings.</h2>
          <p className="mt-4 text-sm leading-relaxed text-stone-600">Subscribe for 7% off orders from ₦50,000 with <strong>WELCOME50</strong>, or 12% off from ₦100,000 with <strong>WELCOME100</strong>.</p>
          <form onSubmit={subscribe} className="mt-6">
            <label className="sr-only" htmlFor="welcome-email">Email address</label>
            <div className="flex">
              <input id="welcome-email" required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Enter your email" className="min-w-0 flex-1 border border-stone-300 px-3 py-2.5 text-sm outline-none focus:border-stone-950" />
              <button disabled={saving} className="bg-stone-950 px-4 py-2.5 text-xs font-semibold tracking-[0.08em] text-white uppercase transition hover:bg-stone-800 disabled:opacity-60">{saving ? "Joining" : "Subscribe"}</button>
            </div>
            <label className="mt-2.5 flex items-start gap-2 text-[11px] leading-relaxed text-stone-600">
              <input required type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} className="mt-0.5 accent-emerald-700" />
              I agree to receive occasional offers and updates by email.
            </label>
          </form>
          {message ? <p className="mt-3 text-sm text-emerald-700">{message}</p> : null}
          <button type="button" onClick={() => close()} className="mt-4 text-[11px] font-medium text-stone-500 underline underline-offset-4">Do not show this again</button>
        </div>
        <div className="relative hidden min-h-full bg-stone-100 md:block">
          <Image src="https://res.cloudinary.com/u3kraw33/image/upload/f_auto,q_auto,w_750,c_limit/v1790056694/beccas-knotique/products/approved-2026-09-22/unisex-granny-square-crochet-cardigan/c7178f12-1794-490c-9916-5bcd6e2bea3d.png" alt="Unisex Granny Square Crochet Cardigan" fill sizes="50vw" className="object-cover" priority />
        </div>
      </section>
    </div>
  );
}
