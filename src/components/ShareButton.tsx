"use client";

import { useEffect, useRef, useState } from "react";
import { Share2, Link2, Check, Mail } from "lucide-react";
import {
  IconBrandWhatsapp,
  IconBrandX,
  IconBrandFacebook,
} from "@tabler/icons-react";

export default function ShareButton({
  path,
  title,
  className = "",
}: {
  /** Relative path, e.g. "/products/golden-hour". The absolute URL is built
   *  from the runtime origin so it always matches the domain the site is on. */
  path: string;
  title: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);
  const [origin, setOrigin] = useState("");
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setOrigin(window.location.origin);
    setCanNativeShare(
      typeof navigator !== "undefined" && typeof navigator.share === "function",
    );
  }, []);

  const url = `${origin}${path}`;

  // close on outside click / escape
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node))
        setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const shareText = `Check out ${title} on Becca's Knotique`;
  const enc = encodeURIComponent;

  async function nativeShare() {
    try {
      await navigator.share({ title, text: shareText, url });
      setOpen(false);
    } catch {
      /* user cancelled */
    }
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      /* ignore */
    }
  }

  const socials = [
    {
      label: "WhatsApp",
      href: `https://wa.me/?text=${enc(`${shareText} ${url}`)}`,
      Icon: IconBrandWhatsapp,
    },
    {
      label: "X",
      href: `https://twitter.com/intent/tweet?text=${enc(shareText)}&url=${enc(url)}`,
      Icon: IconBrandX,
    },
    {
      label: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`,
      Icon: IconBrandFacebook,
    },
    {
      label: "Email",
      href: `mailto:?subject=${enc(title)}&body=${enc(`${shareText}\n\n${url}`)}`,
      Icon: Mail,
    },
  ];

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className={
          className ||
          "inline-flex items-center gap-2 rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 transition hover:border-stone-400 hover:bg-stone-50"
        }
      >
        <Share2 className="h-4 w-4" /> Share
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 z-30 mt-2 w-52 overflow-hidden rounded-2xl border border-stone-200 bg-white p-1.5 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.3)]"
        >
          {canNativeShare ? (
            <button
              type="button"
              onClick={nativeShare}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-stone-700 transition hover:bg-stone-100"
            >
              <Share2 className="h-4 w-4" /> Share via…
            </button>
          ) : null}

          <button
            type="button"
            onClick={copy}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-stone-700 transition hover:bg-stone-100"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 text-emerald-600" /> Link copied!
              </>
            ) : (
              <>
                <Link2 className="h-4 w-4" /> Copy link
              </>
            )}
          </button>

          {socials.map(({ label, href, Icon }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-stone-700 transition hover:bg-stone-100"
            >
              <Icon className="h-4 w-4" /> {label}
            </a>
          ))}
        </div>
      ) : null}
    </div>
  );
}
