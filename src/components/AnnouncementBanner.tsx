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

  return (
    <div className="bg-emerald-700 px-4 py-2 text-center text-xs font-medium tracking-wide text-white sm:text-sm">
      <div
        className="mx-auto max-w-6xl [&_a]:underline [&_a]:underline-offset-2 [&_p]:m-0 [&_p]:inline [&_strong]:font-bold"
        dangerouslySetInnerHTML={{ __html: text }}
      />
    </div>
  );
}
