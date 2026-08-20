"use client";
import { usePathname } from "next/navigation";
import React from "react";
import { SessionProvider } from "next-auth/react";
import Header from "./Header";
import Footer from "./Footer";
import PreFooterCta from "./PreFooterCta";
import AnnouncementBanner from "./AnnouncementBanner";
import { CartProvider } from "@/context/CartContext";

interface providersProps {
  children: React.ReactNode;
}

const Providers = ({ children }: providersProps) => {
  const pathname = usePathname();
  const Homepage = pathname === "/";
  // Admin has its own chrome — hide the storefront header/footer there.
  const hideChrome = pathname.startsWith("/admin");
  const showChrome = !Homepage && !hideChrome;
  return (
    <SessionProvider>
      <CartProvider>
        {!hideChrome && <AnnouncementBanner />}
        {showChrome && <Header />}
        {children}
        {showChrome && <PreFooterCta />}
        {showChrome && <Footer />}
      </CartProvider>
    </SessionProvider>
  );
};

export default Providers;
