"use client";
import { usePathname } from "next/navigation";
import React from "react";
import { SessionProvider } from "next-auth/react";
import Header from "./Header";
import Footer from "./Footer";
import PreFooterCta from "./PreFooterCta";
import AnnouncementBanner from "./AnnouncementBanner";
import ShoppingIntro from "./personalization/ShoppingIntro";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { ShoppingPreferenceProvider } from "@/context/ShoppingPreferenceContext";
import type { StoreSettings } from "@/lib/settings";
import type { ShoppingPreference } from "@/lib/audience";

interface providersProps {
  children: React.ReactNode;
  settings?: StoreSettings;
  preference?: ShoppingPreference | null;
}

const Providers = ({ children, settings, preference = null }: providersProps) => {
  const pathname = usePathname();
  const Homepage = pathname === "/";
  // Admin has its own chrome — hide the storefront header/footer there.
  const hideChrome = pathname.startsWith("/admin");
  const showChrome = !Homepage && !hideChrome;
  // Transactional / utility pages: keep them focused (no "shop now" CTA).
  const hideCta = [
    "/cart",
    "/checkout",
    "/login",
    "/signup",
    "/account",
    "/order",
    "/track",
  ].some((p) => pathname.startsWith(p));
  return (
    <SessionProvider>
      <ShoppingPreferenceProvider initial={preference}>
        <WishlistProvider>
          <CartProvider>
            {!hideChrome && <AnnouncementBanner />}
            {showChrome && <Header />}
            {children}
            {showChrome && !hideCta && <PreFooterCta />}
            {showChrome && (
              <Footer
                instagram={settings?.instagram}
                tiktok={settings?.tiktok}
                whatsapp={settings?.whatsapp}
              />
            )}
            {!hideChrome ? <ShoppingIntro /> : null}
          </CartProvider>
        </WishlistProvider>
      </ShoppingPreferenceProvider>
    </SessionProvider>
  );
};

export default Providers;
