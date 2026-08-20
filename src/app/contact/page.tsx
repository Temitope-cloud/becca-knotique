import type { Metadata } from "next";
import ContactPageClient from "./ContactPageClient";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Contact Becca's Knotique for product inquiries, custom crochet requests, and customer support.",
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: "Contact Us | Becca's Knotique",
    description:
      "Get in touch with Becca's Knotique for support and custom order requests.",
    url: "/contact",
    images: ["https://res.cloudinary.com/u3kraw33/image/upload/v1787262031/beccas-knotique/images/contact.jpg"],
  },
};

export default function ContactPage() {
  return <ContactPageClient />;
}
