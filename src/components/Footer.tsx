import Image from "next/image";
import Link from "next/link";
import React from "react";
import TextPressure from "./ui/TextPressure";
import { Scissors, Sparkles } from "lucide-react";

const Footer = () => {
  const footerMenus = [
    {
      label: "EXPLORE",
      links: [
        { label: "Home", href: "/home" },
        { label: "Process", href: "/process" },
        { label: "Our Story", href: "/our-story" },
        { label: "Contact", href: "/contact" },
      ],
    },
    {
      label: "COLLECTIONS",
      links: [
        { label: "New Arrivals", href: "new-arrivals" },
        { label: "Best Sellers", href: "best-sellers" },
        { label: "Custom Orders", href: "/contact" },
        { label: "Ready to Wear", href: "ready-made" },
      ],
    },

    {
      label: "LEGAL",
      links: [
        { label: "Privacy Policy", href: "/legal/privacy-policy" },
        { label: "TOS", href: "/legal/terms-of-service" },
        { label: "Disclaimer", href: "/legal/disclaimer" },
        { label: "Refund Policy", href: "/legal/refund-policy" },
      ],
    },
  ];

  const year = new Date().getFullYear();
  const socials = [
    {
      label: "Instagram",
      href: "/",
    },
    {
      label: "TikTok",
      href: "/",
    },
    {
      label: "Whatsapp",
      href: "/",
    },
  ];
  return (
    <>
      <div className="w-full bg-[#1a120b] px-10 py-5">
        <div className="flex flex-col justify-between gap-10 md:flex-row">
          <div>
            <Image
              width={250}
              height={100}
              src="/logo.png"
              alt=""
              className=""
            />
          </div>
          <div className="ml-auto grid w-full grid-cols-2 gap-y-10 lg:grid-cols-3">
            {" "}
            {footerMenus.map((footer, idx) => (
              <div key={idx}>
                <h1 className="text-sm text-[#8f8f8f]"> {footer.label} </h1>

                <div className="mt-2 flex flex-col gap-4">
                  {footer.links.map((link, idx) => (
                    <div key={idx}>
                      <Link
                        href={link.href}
                        className="font-arial flex font-medium text-white"
                      >
                        {" "}
                        {link.label}{" "}
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="my-5 flex justify-center border-y border-white/10 px-2 py-5 text-gray-200">
          {" "}
          {socials.map((s, i) => (
            <div
              key={i}
              className={`px-4 ${
                i !== socials.length - 1 ? "border-r border-gray-600/40" : ""
              }`}
            >
              <Link href={s.href}>{s.label}</Link>
            </div>
          ))}
        </div>

        <div className="flex flex-col-reverse items-center justify-center gap-2 text-sm text-white/70 md:flex-row md:justify-between md:gap-0">
          <p className="text-center">
            © {year} {""} Becca&apos;s Knotique. All rights reserved.
          </p>{" "}
          <div className="flex items-center gap-2">
            <Scissors className="h-5 w-5" />
            <p className="text-center">Handmade Crocheting</p>{" "}
          </div>
        </div>
        <div>
          <TextPressure
            text="Becca's"
            className="opacity-5"
            flex
            alpha={false}
            stroke={false}
            width
            weight
            italic
            textColor="#f5f5f5"
            strokeColor="#e1dbdb"
            minFontSize={36}
          />
        </div>
      </div>
    </>
  );
};

export default Footer;
