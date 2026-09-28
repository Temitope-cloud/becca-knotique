"use client";

import { useEffect, useState } from "react";
import Script from "next/script";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID || "G-XJ1WGYNX49";
const CONSENT_COOKIE = "bk_cookie_consent";

function hasAnalyticsConsent() {
  return document.cookie.split("; ").includes(`${CONSENT_COOKIE}=accepted`);
}

export default function GoogleAnalytics() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const updateConsent = () => setEnabled(hasAnalyticsConsent());
    updateConsent();
    window.addEventListener("bk-cookie-consent", updateConsent);
    return () => window.removeEventListener("bk-cookie-consent", updateConsent);
  }, []);

  if (process.env.NODE_ENV !== "production" || !GA_ID || !enabled) return null;

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
      <Script id="ga-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', '${GA_ID}');`}
      </Script>
    </>
  );
}
