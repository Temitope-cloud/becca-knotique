"use client";
import { usePathname } from "next/navigation";
import React from "react";
import { SessionProvider } from "next-auth/react";
import Header from "./Header";
import Footer from "./Footer";
import PreFooterCta from "./PreFooterCta";
import AnnouncementBanner from "./AnnouncementBanner";
import AudiencePrompt from "./AudiencePrompt";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import type { StoreSettings } from "@/lib/settings";

interface providersProps {
  children: React.ReactNode;
  settings?: StoreSettings;
}

const Providers = ({ children, settings }: providersProps) => {
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
          {showChrome && !hideCta ? <AudiencePrompt /> : null}
        </CartProvider>
      </WishlistProvider>
    </SessionProvider>
  );
};

export default Providers;
