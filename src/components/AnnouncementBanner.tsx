"use client";

import { useEffect, useState } from "react";

export default function AnnouncementBanner() {
  const [text, setText] = useState("");

  useEffect(() => {
    fetch("/api/store-settings")
      .then((r) => r.json())
      .then((d) => setText(typeof d?.announcement === "string" ? d.announcement : ""))
      .catch(() => {});
  }, []);

  if (!text) return null;

  // Existing announcements that are plain text should still lead shoppers to
  // the collection. Rich-text announcements can include their own links.
  const hasLink = /<a\s/i.test(text);
  const content = (
    <div
      className="mx-auto max-w-6xl select-text [&_a]:pointer-events-auto [&_a]:cursor-pointer [&_a]:underline [&_a]:underline-offset-2 [&_p]:m-0 [&_p]:inline [&_strong]:font-bold"
      dangerouslySetInnerHTML={{ __html: text }}
    />
  );

  return (
    <div className="relative z-[60] bg-emerald-700 px-4 py-2 text-center text-xs font-medium tracking-wide text-white sm:text-sm">
      {hasLink ? content : (
        <a
          href="/products"
          className="block cursor-pointer text-white no-underline hover:text-white/90"
          aria-label="Shop the announcement offer"
        >
          {content}
        </a>
      )}
    </div>
  );
}
