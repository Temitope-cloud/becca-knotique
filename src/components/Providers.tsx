"use client";
import { usePathname } from "next/navigation";
import React from "react";
import Header from "./Header";
import Footer from "./Footer";
import PreFooterCta from "./PreFooterCta";

interface providersProps {
  children: React.ReactNode;
}

const Providers = ({ children }: providersProps) => {
  const pathname = usePathname();
  const Homepage = pathname === "/";
  return (
    <>
      {}
      {!Homepage && <Header />}
      {children}
      {!Homepage && <PreFooterCta />}
      {!Homepage && <Footer />}
    </>
  );
};

export default Providers;
