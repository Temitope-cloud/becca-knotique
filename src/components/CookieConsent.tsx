"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const CONSENT_COOKIE = "bk_cookie_consent";
const MAX_AGE = 60 * 60 * 24 * 365;

function savedConsent() {
  return document.cookie
    .split("; ")
    .find((item) => item.startsWith(`${CONSENT_COOKIE}=`))
    ?.split("=")[1];
}

export default function CookieConsent() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(!savedConsent());
    const reopen = () => setOpen(true);
    window.addEventListener("bk-cookie-settings", reopen);
    return () => window.removeEventListener("bk-cookie-settings", reopen);
  }, []);

  function choose(value: "accepted" | "rejected") {
    document.cookie = `${CONSENT_COOKIE}=${value}; path=/; max-age=${MAX_AGE}; samesite=lax`;
    window.dispatchEvent(new Event("bk-cookie-consent"));
    setOpen(false);
  }

  if (!open || pathname.startsWith("/admin")) return null;

  return (
    <section
      aria-label="Cookie choices"
      className="fixed right-4 bottom-4 z-50 w-[calc(100%-2rem)] max-w-md rounded-2xl border border-stone-200 bg-white p-5 shadow-2xl shadow-stone-900/20 sm:right-6 sm:bottom-6"
    >
      <h2 className="text-base font-semibold text-stone-900">Your cookie choices</h2>
      <p className="mt-2 text-sm leading-relaxed text-stone-600">
        We use essential cookies to run the store and optional analytics cookies to understand how visitors use it. You can accept or decline analytics cookies. Read our{" "}
        <Link href="/legal/privacy-policy" className="font-medium text-stone-900 underline underline-offset-2">
          Privacy Policy
        </Link>{" "}
        for details.
      </p>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
        <button type="button" onClick={() => choose("rejected")} className="rounded-xl border border-stone-300 px-4 py-2.5 text-sm font-semibold text-stone-700 hover:bg-stone-50">
          Decline analytics
        </button>
        <button type="button" onClick={() => choose("accepted")} className="rounded-xl bg-stone-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-stone-800">
          Accept analytics
        </button>
      </div>
    </section>
  );
}
