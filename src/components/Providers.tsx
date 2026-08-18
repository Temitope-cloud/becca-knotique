"use client";
import { usePathname } from "next/navigation";
import React from "react";
import { SessionProvider } from "next-auth/react";
import Header from "./Header";
import Footer from "./Footer";
import PreFooterCta from "./PreFooterCta";
import { CartProvider } from "@/context/CartContext";

interface providersProps {
  children: React.ReactNode;
}

const Providers = ({ children }: providersProps) => {
  const pathname = usePathname();
  const Homepage = pathname === "/";
  return (
    <SessionProvider>
      <CartProvider>
        {!Homepage && <Header />}
        {children}
        {!Homepage && <PreFooterCta />}
        {!Homepage && <Footer />}
      </CartProvider>
    </SessionProvider>
  );
};

export default Providers;
