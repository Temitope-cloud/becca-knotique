"use client";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { usePathname } from "next/navigation";
import Image from "next/image";

const MENUS = [
  { label: "Home", href: "/" },
  { label: "Products", href: "/products" },
  { label: "Featured", href: "/#featured" },
  { label: "About", href: "/about" },
  {
    label: "Contact",
    href: "/contact",
  },
] as const;

const Header = () => {
  const [menuClicked, setMenuClicked] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const pathname = usePathname();
  const Homepage = pathname === "/";

  const closeMenu = () => setMenuClicked(false);

  useEffect(() => {
    if (!menuRef.current) return;

    if (menuClicked) {
      gsap.fromTo(
        menuRef.current,
        { y: "-100%", opacity: 0 },
        {
          y: "0%",
          opacity: 1,
          duration: 0.55,
          ease: "power3.out",
        },
      );
    } else {
      gsap.to(menuRef.current, {
        y: "-100%",
        opacity: 0,
        duration: 0.45,
        ease: "power2.in",
      });
    }
  }, [menuClicked]);

  useEffect(() => {
    if (menuClicked) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuClicked]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMenu();
    };
    if (menuClicked) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuClicked]);

  const handleMenuClick = () => {
    setMenuClicked((open) => !open);
  };

  const linkClass =
    "block border-b border-white/10 py-4 text-2xl font-light tracking-wide text-white transition-colors hover:text-amber-100 sm:text-3xl";

  return (
    <>
      <header
        className={`relative z-50 flex items-center border-b border-b-gray-100/60 ${!Homepage && "bg-amber-950/70"} px-2 pt-5 pb-2 sm:px-4`}
      >
        <div className="z-60 w-full">
          {/* <Link
            href="/"
            onClick={closeMenu}
            className="font-akira inline-block cursor-pointer font-bold tracking-wider text-white"
          >
            Becca&apos;s Knotique

          
          </Link> */}

          <img
            src="/light-logo.png"
            alt="Becca's Knotique"
            className="h-15 w-15"
          />
        </div>

        <div className="hidden w-full justify-between lg:flex">
          {MENUS.map((menu, idx) =>
            menu.href.startsWith("mailto:") ? (
              <a
                key={idx}
                href={menu.href}
                className="relative top-0 cursor-pointer font-light text-white before:absolute before:bottom-0 before:h-0.5 before:w-0 before:bg-white before:transition-all before:duration-300 hover:text-gray-100 hover:before:w-full"
              >
                {menu.label}
              </a>
            ) : (
              <Link
                key={idx}
                href={menu.href}
                className="relative top-0 cursor-pointer font-light text-white before:absolute before:bottom-0 before:h-0.5 before:w-0 before:bg-white before:transition-all before:duration-300 hover:text-gray-100 hover:before:w-full"
              >
                {menu.label}
              </Link>
            ),
          )}
        </div>

        <div className="hidden w-full justify-end lg:flex">
          <Link
            href="/our-story"
            className="bg-muted/90 hover:bg-muted cursor-pointer rounded border border-black/50 px-10 py-2 font-semibold transition-all duration-300"
          >
            Our Story
          </Link>
        </div>

        <div
          className={`group z-60 flex cursor-pointer flex-col items-end md:hidden ${menuClicked ? "gap-0" : "gap-2"}`}
          onClick={handleMenuClick}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleMenuClick();
            }
          }}
          aria-expanded={menuClicked}
          aria-controls="mobile-navigation"
          aria-label={menuClicked ? "Close menu" : "Open menu"}
        >
          <span
            className={`h-0.5 bg-white transition-all duration-300 ${menuClicked ? "w-10" : "w-5 group-hover:w-10"}`}
          />
          <span
            className={`h-0.5 w-10 bg-white transition-all duration-300 ${menuClicked ? "hidden" : "block"} `}
          />
          <span
            className={`h-0.5 bg-white transition-all duration-300 ${menuClicked ? "w-10 rotate-90" : "w-5 group-hover:w-10"}`}
          />
        </div>

        <div
          ref={menuRef}
          id="mobile-navigation"
          role="dialog"
          aria-modal="true"
          aria-label="Site navigation"
          className={`fixed inset-0 z-40 flex h-dvh w-full -translate-y-full flex-col bg-neutral-950 opacity-0 ${menuClicked ? "pointer-events-auto" : "pointer-events-none"}`}
          style={{ willChange: "transform, opacity" }}
          onClick={closeMenu}
        >
          <div
            className="pointer-events-auto flex min-h-0 flex-1 flex-col px-6 pt-24 pb-10 sm:px-10"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-xs font-semibold tracking-[0.25em] text-white/40 uppercase">
              Menu
            </p>
            <nav
              className="mt-6 flex flex-1 flex-col justify-center"
              aria-label="Primary"
            >
              <ul className="space-y-0">
                {MENUS.map((menu, idx) => (
                  <li key={idx}>
                    {menu.href.startsWith("mailto:") ? (
                      <a
                        href={menu.href}
                        className={linkClass}
                        onClick={closeMenu}
                      >
                        {menu.label}
                      </a>
                    ) : (
                      <Link
                        href={menu.href}
                        className={linkClass}
                        onClick={closeMenu}
                        scroll
                      >
                        {menu.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </nav>

            <div className="mt-auto space-y-4 border-t border-white/10 pt-8">
              <Link
                href="/#our-story"
                onClick={closeMenu}
                scroll
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 px-6 py-3.5 text-center text-sm font-semibold tracking-wide text-white backdrop-blur-sm transition hover:bg-white/20"
              >
                Our story
                <ArrowRight className="size-4" />
              </Link>
              <p className="text-center text-xs text-white/45">
                Handmade crochet — made to order.
              </p>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
