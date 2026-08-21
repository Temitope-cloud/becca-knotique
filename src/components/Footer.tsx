"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import {
  IconBrandInstagram,
  IconBrandTiktok,
  IconBrandWhatsapp,
} from "@tabler/icons-react";
import { ArrowUpRight, ArrowUp, Heart } from "lucide-react";

const footerMenus = [
  {
    label: "Shop",
    links: [
      { label: "All Products", href: "/products" },
      { label: "New Arrivals", href: "/products" },
      { label: "Track Order", href: "/track" },
      { label: "Trending", href: "/trending" },
    ],
  },
  {
    label: "Explore",
    links: [
      { label: "Home", href: "/" },
      { label: "About", href: "/about" },
      { label: "Our Story", href: "/our-story" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    label: "Support",
    links: [
      { label: "Privacy Policy", href: "/legal/privacy-policy" },
      { label: "Terms of Service", href: "/legal/terms-of-service" },
      { label: "Disclaimer", href: "/legal/disclaimer" },
      { label: "Refund Policy", href: "/legal/refund-policy" },
    ],
  },
];

const socials = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/beccasknotique/",
    Icon: IconBrandInstagram,
  },
  {
    label: "TikTok",
    href: "https://www.tiktok.com/@beccas_knotique/",
    Icon: IconBrandTiktok,
  },
  {
    label: "WhatsApp",
    href: "https://wa.me/2348029086678",
    Icon: IconBrandWhatsapp,
  },
];

const Footer = () => {
  const year = new Date().getFullYear();
  const footerRef = useRef<HTMLElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef(0);

  const handleMove = (e: React.MouseEvent) => {
    const el = footerRef.current;
    const glow = glowRef.current;
    if (!el || !glow) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      glow.style.opacity = "1";
      glow.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    });
  };

  const handleLeave = () => {
    if (glowRef.current) glowRef.current.style.opacity = "0";
  };

  const scrollTop = () =>
    window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <footer
      ref={footerRef}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className="relative overflow-hidden bg-[#0a0a0a] text-white"
    >
      {/* cursor-following accent glow */}
      <div
        ref={glowRef}
        aria-hidden
        className="pointer-events-none absolute top-0 left-0 -mt-[300px] -ml-[300px] hidden h-[600px] w-[600px] rounded-full opacity-0 blur-3xl transition-opacity duration-500 will-change-transform lg:block"
        style={{
          background:
            "radial-gradient(circle, rgba(5,150,105,0.16), transparent 62%)",
        }}
      />
      {/* top hairline */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 pt-16 pb-8 sm:px-10 sm:pt-20 lg:px-16">
        {/* top: brand + link columns */}
        <div className="grid gap-12 lg:grid-cols-[1.25fr_1.75fr] lg:gap-16">
          {/* brand block */}
          <div className="max-w-sm">
            <Image
              width={220}
              height={88}
              src="https://res.cloudinary.com/u3kraw33/image/upload/v1787262022/beccas-knotique/footer-logo.png"
              alt="Becca's Knotique"
              className="h-auto w-40 sm:w-48"
            />
            <p className="mt-5 text-sm leading-relaxed text-white/60">
              Handmade crochet fashion and custom statement pieces, crafted with
              care in Nigeria — made by hand, made for you.
            </p>

            <Link
              href="/contact"
              className="group mt-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-medium text-white transition hover:border-[#059669]/50 hover:bg-[#059669]/10"
            >
              Have a custom idea? Let&apos;s make it
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>

            <div className="mt-7 flex items-center gap-3">
              {socials.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 transition hover:border-[#059669]/50 hover:bg-[#059669]/15 hover:text-white focus-visible:ring-2 focus-visible:ring-[#059669]/60 focus-visible:outline-none"
                >
                  <Icon className="h-5 w-5" stroke={1.6} />
                </a>
              ))}
            </div>
          </div>

          {/* link columns */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {footerMenus.map((menu) => (
              <nav key={menu.label} aria-label={menu.label}>
                <h2 className="text-xs font-semibold tracking-[0.18em] text-white/40 uppercase">
                  {menu.label}
                </h2>
                <ul className="mt-4 space-y-3">
                  {menu.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm text-white/70 transition-colors hover:text-white"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        {/* giant wordmark */}
        <div className="mt-16 sm:mt-20">
          <h2
            aria-hidden
            className="font-apparel pointer-events-none bg-gradient-to-b from-white/[0.13] to-white/[0.03] bg-clip-text text-center leading-[0.85] tracking-tight text-transparent select-none"
            style={{ fontSize: "clamp(2.75rem, 14vw, 12rem)" }}
          >
            Becca&apos;s Knotique
          </h2>
        </div>

        {/* bottom bar */}
        <div className="mt-10 flex flex-col items-center gap-4 border-t border-white/10 pt-6 sm:flex-row sm:justify-between">
          <p className="order-2 text-center text-xs text-white/50 sm:order-1 sm:text-left">
            © {year}{" "}
            Becca&apos;s Knotique. All rights reserved.
          </p>

          <div className="order-1 flex items-center gap-5 sm:order-2">
            <a
              href="https://temistudio.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-white/60 transition hover:text-white"
            >
              Designed with
              <Heart className="h-3.5 w-3.5 fill-[#059669] text-[#059669]" />
              by Temi Studio
            </a>
            <button
              type="button"
              onClick={scrollTop}
              aria-label="Back to top"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 transition hover:border-[#059669]/50 hover:bg-[#059669]/15 hover:text-white"
            >
              <ArrowUp className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
