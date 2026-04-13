"use client";
import { usePathname } from "next/navigation";
import React from "react";
import Header from "./Header";
import Footer from "./Footer";

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
      {!Homepage && <Footer />}
    </>
  );
};

export default Providers;
