"use client";

import React from "react";
import { ParallaxImage } from "@/components/ui/ParallexImage";
import Link from "next/link";
import { AccordionReuse } from "@/components/ui/accordionReuse";
import { IconBrandWhatsapp } from "@tabler/icons-react";

const ContactPageClient = () => {
  const contact = [
    {
      title: "Email",
      label: "beccasknotique@gmail.com",
      href: "mailto:beccasknotique@gmail.com",
    },
    {
      title: "Whatsapp",
      label: "Chat on whatsapp",
      href: "https://wa.me/2348029086678",
    },
    {
      title: "Phone",
      label: "+234 902 428 4905",
      href: "tel:+2349024284905",
    },
    { title: "Location", label: "Nigeria", href: "#" },
  ];

  return (
    <div className="my-20 px-10">
      <div className="flex gap-7">
        <div className="flex-1">
          <h2 className="font-apparel text-8xl font-medium">Support</h2>
          <p className="mt-10 text-xl font-medium">
            Do you have any questions about our products? <br /> You can send us
            an email or text us
          </p>

          <div className="mt-10">
            <div className="border-b">
              {contact.map((c) => (
                <div key={c.title} className="mb-5">
                  <p className="text-sm text-gray-500">{c.title}</p>
                  <Link
                    href={c.href}
                    target="_blank"
                    className="font-arial text-xl font-medium"
                  >
                    {c.label}
                  </Link>
                </div>
              ))}
            </div>

            <div className="mt-5">
              <h2 className="font-apparel text-5xl font-medium">FAQ</h2>
              <AccordionReuse />
              <p className="mt-5 flex flex-wrap gap-1 text-sm text-gray-700">
                We didn&apos;t answer your question?{" "}
                <Link
                  href="https://wa.me/2348029086678"
                  target="_blank"
                  className="flex items-center gap-0.5 font-semibold text-blue-900"
                >
                  Contact us on whatsapp <IconBrandWhatsapp size={20} />
                </Link>
              </p>
            </div>
          </div>
        </div>
        <div className="hidden md:block md:flex-1">
          <ParallaxImage
            src="/images/contact.jpg"
            alt="Contact"
            className="h-screen object-cover"
          />
        </div>
      </div>
    </div>
  );
};

export default ContactPageClient;
