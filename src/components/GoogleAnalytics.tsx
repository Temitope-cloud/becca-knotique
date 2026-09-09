import Script from "next/script";

// GA4 measurement IDs are public (they appear in the page), so a default is
// safe. Override with NEXT_PUBLIC_GA_ID if it ever changes.
const GA_ID = process.env.NEXT_PUBLIC_GA_ID || "G-XJ1WGYNX49";

/**
 * Google Analytics (gtag.js). Loaded only in production so local development
 * and previews don't count as real traffic.
 */
export default function GoogleAnalytics() {
  if (process.env.NODE_ENV !== "production" || !GA_ID) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}');
        `}
      </Script>
    </>
  );
}
