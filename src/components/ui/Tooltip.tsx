"use client";

import { useId, useState } from "react";

/**
 * Lightweight, accessible tooltip. Shows on hover and keyboard focus.
 * Wrap any element: <Tooltip label="Save to wishlist"><button …/></Tooltip>
 */
export default function Tooltip({
  label,
  children,
  side = "top",
  wide = false,
}: {
  label: string;
  children: React.ReactNode;
  side?: "top" | "bottom";
  /** allow the tooltip to wrap onto multiple lines for longer explanations */
  wide?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const id = useId();

  const pos =
    side === "top"
      ? "bottom-full left-1/2 mb-2 -translate-x-1/2"
      : "top-full left-1/2 mt-2 -translate-x-1/2";
  const sizing = wide
    ? "w-56 whitespace-normal text-center leading-snug"
    : "whitespace-nowrap";

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocusCapture={() => setOpen(true)}
      onBlurCapture={() => setOpen(false)}
    >
      <span aria-describedby={open ? id : undefined}>{children}</span>
      <span
        role="tooltip"
        id={id}
        className={`pointer-events-none absolute z-40 rounded-md bg-stone-900 px-2 py-1 text-xs font-medium text-white shadow-lg transition-opacity duration-150 ${sizing} ${pos} ${
          open ? "opacity-100" : "opacity-0"
        }`}
      >
        {label}
      </span>
    </span>
  );
}
