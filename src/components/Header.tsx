"use client";

import { Mail, MapPin, Search, User, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import CartIcon from "./cart/CartIcon";
import ShoppingForSelector from "./personalization/ShoppingForSelector";
import { useCart } from "@/context/CartContext";

const MENUS = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/products" },
  { label: "Journal", href: "/journal" },
  { label: "About", href: "/about" },
] as const;

export default function Header({ supportEmail = "beccasknotique@gmail.com", address = "" }: { supportEmail?: string; address?: string }) {
  const [menuClicked, setMenuClicked] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const pathname = usePathname();
  const { data: session } = useSession();
  const { count, hydrated } = useCart();
  const closeMenu = () => setMenuClicked(false);

  useEffect(() => { setMenuClicked(false); setSearchOpen(false); }, [pathname]);
  useEffect(() => { if (searchOpen) searchInputRef.current?.focus(); }, [searchOpen]);
  useEffect(() => {
    document.body.style.overflow = menuClicked ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuClicked]);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") { closeMenu(); setSearchOpen(false); } };
    if (menuClicked || searchOpen) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuClicked, searchOpen]);

  const desktopLink = "text-[13px] font-medium tracking-wide text-stone-700 transition hover:text-stone-950";
  const mobileLink = "block border-b border-white/10 py-4 text-2xl font-light tracking-wide text-white transition-colors hover:text-emerald-300 sm:text-3xl";

  return <header className="relative z-50 w-full">
    <div className="hidden border-b border-stone-200 bg-white lg:block">
      <div className="mx-auto flex h-10 max-w-[1600px] items-center justify-between px-8 text-xs">
        <div className="flex items-center gap-5 text-stone-500">
          {address ? <span className="inline-flex items-center gap-2"><MapPin className="size-3.5" />{address}</span> : null}
          <a href={`mailto:${supportEmail}`} className="inline-flex items-center gap-2 transition hover:text-stone-950"><Mail className="size-3.5" />{supportEmail}</a>
        </div>
        <div className="flex items-center gap-5">
          <ShoppingForSelector className="text-stone-600" />
          <span className="h-4 w-px bg-stone-200" />
          <Link href="/contact#faq" className={desktopLink}>FAQs</Link>
          <Link href="/contact" className={desktopLink}>Contact</Link>
          <Link href={session?.user ? "/account" : "/login"} className={`inline-flex items-center gap-1.5 ${desktopLink}`}><User className="size-3.5" />{session?.user ? "Account" : "Sign in"}</Link>
        </div>
      </div>
    </div>

    <div className="border-b border-white/15 bg-neutral-950 px-4 py-4 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-6 lg:gap-8">
        <Link href="/" onClick={closeMenu} className="shrink-0" aria-label="Becca's Knotique home">
          <img src="https://res.cloudinary.com/u3kraw33/image/upload/v1787262078/beccas-knotique/light-logo.png" alt="Becca's Knotique" className="h-12 w-12 object-contain lg:h-14 lg:w-14" />
        </Link>

        <nav className="hidden min-w-0 flex-1 lg:block" aria-label="Primary">
          <ul className="flex items-center justify-center gap-x-8 xl:gap-x-10">
            {MENUS.map((menu) => <li key={menu.href}><Link href={menu.href} className="relative whitespace-nowrap text-[15px] font-medium tracking-wide text-white transition hover:text-emerald-200 after:absolute after:-bottom-2 after:left-0 after:h-px after:w-0 after:bg-emerald-200 after:transition-all hover:after:w-full">{menu.label}</Link></li>)}
          </ul>
        </nav>

        <div className="hidden shrink-0 items-center gap-5 lg:flex">
          <button type="button" onClick={() => setSearchOpen((open) => !open)} aria-label="Search products" aria-expanded={searchOpen} aria-controls="header-search-panel" className="text-white transition hover:text-emerald-200"><Search className="size-5" /></button>
          <Link href="/our-story" className="whitespace-nowrap text-sm font-medium text-white transition hover:text-emerald-200">Our story</Link>
          <CartIcon className="text-white transition hover:text-emerald-200" />
        </div>

        <button type="button" onClick={() => setMenuClicked((open) => !open)} aria-expanded={menuClicked} aria-controls="mobile-navigation" aria-label={menuClicked ? "Close menu" : "Open menu"} className="group relative z-[60] -mr-2 flex h-11 w-11 shrink-0 items-center justify-center lg:hidden">
          {menuClicked ? <X className="size-7 text-white" aria-hidden="true" /> : <span className="flex flex-col items-end gap-2"><span className="h-0.5 w-5 bg-white transition-all duration-300 group-hover:w-8" /><span className="h-0.5 w-8 bg-white" /><span className="h-0.5 w-5 bg-white transition-all duration-300 group-hover:w-8" /></span>}
        </button>
      </div>
    </div>

    <motion.div id="header-search-panel" initial={false} animate={searchOpen ? { opacity: 1, y: 0 } : { opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className={`absolute top-full right-0 left-0 border-b border-white/10 bg-neutral-950 shadow-xl ${searchOpen ? "pointer-events-auto" : "pointer-events-none"}`}>
      <form action="/products" className="mx-auto flex max-w-[1600px] items-center gap-3 px-4 py-4 sm:px-6 lg:px-8">
        <Search className="size-5 shrink-0 text-emerald-200" aria-hidden="true" />
        <label htmlFor="header-search" className="sr-only">Search products</label>
        <input ref={searchInputRef} id="header-search" name="q" type="search" placeholder="Search dresses, bags, sets and more" className="min-w-0 flex-1 bg-transparent py-2 text-base text-white placeholder:text-white/50 outline-none" />
        <button type="submit" className="rounded-full bg-white px-5 py-2 text-xs font-semibold tracking-[0.1em] text-stone-950 uppercase transition hover:bg-emerald-100">Search</button>
        <button type="button" onClick={() => setSearchOpen(false)} className="p-2 text-white/70 transition hover:text-white" aria-label="Close search"><X className="size-5" /></button>
      </form>
    </motion.div>

    <motion.div id="mobile-navigation" role="dialog" aria-modal="true" aria-label="Site navigation" initial={{ y: "-100%", opacity: 0 }} animate={menuClicked ? { y: "0%", opacity: 1 } : { y: "-100%", opacity: 0 }} transition={{ duration: menuClicked ? 0.55 : 0.45, ease: menuClicked ? [0.16, 1, 0.3, 1] : [0.7, 0, 0.84, 0] }} className={`fixed inset-0 z-40 flex h-dvh w-full flex-col bg-neutral-950 ${menuClicked ? "pointer-events-auto" : "pointer-events-none"}`} onClick={closeMenu}>
      <div className="pointer-events-auto flex min-h-0 flex-1 flex-col px-6 pt-24 pb-10 sm:px-10" onClick={(event) => event.stopPropagation()}>
        <p className="text-xs font-semibold tracking-[0.25em] text-white/40 uppercase">Menu</p>
        <nav className="mt-6 flex flex-1 flex-col justify-center" aria-label="Primary"><ul>{MENUS.map((menu) => <li key={menu.href}><Link href={menu.href} className={mobileLink} onClick={closeMenu}>{menu.label}</Link></li>)}<li><Link href="/our-story" className={mobileLink} onClick={closeMenu}>Our story</Link></li><li><Link href="/contact" className={mobileLink} onClick={closeMenu}>Contact &amp; FAQs</Link></li></ul></nav>
        <div className="mt-auto space-y-3 border-t border-white/10 pt-8"><ShoppingForSelector className="text-white" /><a href={`mailto:${supportEmail}`} className="flex items-center gap-2 text-sm text-white/70"><Mail className="size-4" />{supportEmail}</a><div className="grid grid-cols-2 gap-3"><Link href="/cart" onClick={closeMenu} className="flex items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 px-4 py-3.5 text-sm font-semibold text-white">Cart {hydrated && count > 0 ? <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-emerald-500 px-1 text-[11px] font-bold text-stone-900">{count > 99 ? "99+" : count}</span> : null}</Link><Link href={session?.user ? "/account" : "/login"} onClick={closeMenu} className="flex items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 px-4 py-3.5 text-sm font-semibold text-white"><User className="size-4" />{session?.user ? "Account" : "Sign in"}</Link></div><p className="text-center text-xs text-white/45">Handmade crochet, made for you.</p></div>
      </div>
    </motion.div>
  </header>;
}
