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
          <p className="text-[10px] font-semibold tracking-[0.18em] text-emerald-700 uppercase">A welcome from Becca&apos;s Knotique</p>
          <h2 id="welcome-offer-title" className="mt-3 text-3xl font-semibold tracking-tight text-stone-950">More to love in every order.</h2>
          <p className="mt-3 text-sm leading-relaxed text-stone-600">Join our list for new drops and handmade stories. Your cart can unlock these welcome offers.</p>
          <div className="mt-5 space-y-2 text-xs">
            <p className="border-l-2 border-stone-950 pl-3"><strong>WELCOME50</strong> · 7% off from ₦50,000</p>
            <p className="border-l-2 border-emerald-700 pl-3"><strong>WELCOME100</strong> · 12% off from ₦100,000</p>
          </div>
          <form onSubmit={subscribe} className="mt-5">
            <label className="sr-only" htmlFor="welcome-email">Email address</label>
            <input id="welcome-email" required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Enter your email" className="w-full border border-stone-300 px-3 py-2.5 text-sm outline-none focus:border-stone-950" />
            <label className="mt-2.5 flex items-start gap-2 text-[11px] leading-relaxed text-stone-600">
              <input required type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} className="mt-0.5 accent-emerald-700" />
              I agree to receive occasional offers and updates by email.
            </label>
            <button disabled={saving} className="mt-3 w-full bg-stone-950 px-5 py-2.5 text-xs font-semibold tracking-[0.1em] text-white uppercase transition hover:bg-stone-800 disabled:opacity-60">{saving ? "Joining..." : "Join the list"}</button>
          </form>
          {message ? <p className="mt-3 text-sm text-emerald-700">{message}</p> : null}
          <button type="button" onClick={() => close()} className="mt-4 text-[11px] font-medium text-stone-500 underline underline-offset-4">Do not show this again</button>
        </div>
        <div className="relative hidden min-h-full bg-stone-100 md:block">
          <Image src="https://res.cloudinary.com/u3kraw33/image/upload/v1787262028/beccas-knotique/images/about2.jpg" alt="Becca's Knotique handmade crochet look" fill sizes="50vw" className="object-cover" priority />
        </div>
      </section>
    </div>
  );
}
