"use client";
import { ArrowRight, User } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import CartIcon from "./cart/CartIcon";
import { useCart } from "@/context/CartContext";

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
  const { data: session } = useSession();
  const { count, hydrated } = useCart();

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

  const navLinkClass =
    "whitespace-nowrap text-[15px] font-light tracking-wide text-white transition-colors hover:text-white/90";

  return (
    <>
      <header
        className={`relative z-50 flex items-center justify-between gap-6 border-b border-b-gray-100/60 ${!Homepage && "bg-amber-950/70"} px-4 py-4 sm:px-6 lg:gap-8 lg:px-8`}
      >
        <div className="z-60 shrink-0">
          <Link
            href="/"
            onClick={closeMenu}
            // className="font-akira inline-block cursor-pointer font-bold tracking-wider text-white"
          >
            <img
              src="/light-logo.png"
              alt="Becca's Knotique"
              className="h-15 w-15"
            />
          </Link>
        </div>

        <nav
          className="hidden min-w-0 flex-1 items-center justify-center lg:flex"
          aria-label="Primary"
        >
          <ul className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 xl:gap-x-10">
            {MENUS.map((menu, idx) => (
              <li key={idx}>
                {menu.href.startsWith("mailto:") ? (
                  <a
                    href={menu.href}
                    className={`${navLinkClass} relative after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-white/80 after:transition-all after:duration-300 hover:after:w-full`}
                  >
                    {menu.label}
                  </a>
                ) : (
                  <Link
                    href={menu.href}
                    className={`${navLinkClass} relative after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-white/80 after:transition-all after:duration-300 hover:after:w-full`}
                  >
                    {menu.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>

        <div className="hidden shrink-0 items-center gap-5 lg:flex">
          <CartIcon className="text-white transition hover:text-white/80" />
          <Link
            href={session?.user ? "/account" : "/login"}
            aria-label={session?.user ? "My account" : "Sign in"}
            className="inline-flex items-center gap-2 text-sm font-medium text-white transition hover:text-white/80"
          >
            <User className="h-5 w-5" />
            <span>{session?.user ? "Account" : "Sign in"}</span>
          </Link>
          <Link
            href="/our-story"
            className="rounded-md border border-white/35 bg-white/10 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-white/15"
          >
            Our Story
          </Link>
        </div>

        <div
          className={`group z-60 flex cursor-pointer flex-col items-end lg:hidden ${menuClicked ? "gap-0" : "gap-2"}`}
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

            <div className="mt-auto space-y-3 border-t border-white/10 pt-8">
              <div className="grid grid-cols-2 gap-3">
                <Link
                  href="/cart"
                  onClick={closeMenu}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 px-4 py-3.5 text-center text-sm font-semibold text-white transition hover:bg-white/20"
                >
                  Cart
                  {hydrated && count > 0 ? (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#e3948e] px-1 text-[11px] font-bold text-stone-900">
                      {count > 99 ? "99+" : count}
                    </span>
                  ) : null}
                </Link>
                <Link
                  href={session?.user ? "/account" : "/login"}
                  onClick={closeMenu}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 px-4 py-3.5 text-center text-sm font-semibold text-white transition hover:bg-white/20"
                >
                  <User className="size-4" />
                  {session?.user ? "Account" : "Sign in"}
                </Link>
              </div>
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
