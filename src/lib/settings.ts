import "server-only";
import { cache } from "react";
import { connectToDatabase } from "@/lib/db";
import { Settings, type ISettings } from "@/lib/models/Settings";

export interface StorePolicies {
  privacy: string;
  terms: string;
  refund: string;
  disclaimer: string;
}

export interface StoreSettings {
  storeName: string;
  supportEmail: string;
  supportPhone: string;
  announcement: string;
  shippingFee: number;
  freeShippingThreshold: number;
  address: string;
  instagram: string;
  tiktok: string;
  whatsapp: string;
  foundedYear: string;
  metaTitle: string;
  metaDescription: string;
  policies: StorePolicies;
}

const defaults: StoreSettings = {
  storeName: "Becca's Knotique",
  supportEmail: "beccasknotique@gmail.com",
  supportPhone: "2348029086678",
  announcement: "",
  shippingFee: 0,
  freeShippingThreshold: 0,
  address: "",
  instagram: "https://www.instagram.com/beccasknotique/",
  tiktok: "https://www.tiktok.com/@beccas_knotique/",
  whatsapp: "https://wa.me/2348029086678",
  foundedYear: "2022",
  metaTitle: "Becca's Knotique | Handmade Crochet Fashion",
  metaDescription:
    "Discover handmade crochet fashion, statement pieces, and custom designs crafted with care by Becca's Knotique.",
  policies: { privacy: "", terms: "", refund: "", disclaimer: "" },
};

/** Cached per request so layout, pages, and metadata share one DB read. */
export const getSettings = cache(async (): Promise<StoreSettings> => {
  try {
    await connectToDatabase();
    const doc = await Settings.findOne({ key: "store" }).lean<ISettings>();
    if (!doc) return defaults;
    return {
      storeName: doc.storeName ?? defaults.storeName,
      supportEmail: doc.supportEmail ?? defaults.supportEmail,
      supportPhone: doc.supportPhone ?? defaults.supportPhone,
      announcement: doc.announcement ?? "",
      shippingFee: doc.shippingFee ?? 0,
      freeShippingThreshold: doc.freeShippingThreshold ?? 0,
      address: doc.address ?? "",
      instagram: doc.instagram ?? defaults.instagram,
      tiktok: doc.tiktok ?? defaults.tiktok,
      whatsapp: doc.whatsapp ?? defaults.whatsapp,
      foundedYear: doc.foundedYear ?? defaults.foundedYear,
      metaTitle: doc.metaTitle ?? defaults.metaTitle,
      metaDescription: doc.metaDescription ?? defaults.metaDescription,
      policies: {
        privacy: doc.policies?.privacy ?? "",
        terms: doc.policies?.terms ?? "",
        refund: doc.policies?.refund ?? "",
        disclaimer: doc.policies?.disclaimer ?? "",
      },
    };
  } catch {
    return defaults;
  }
});

/** Shipping fee for a given subtotal, honoring the free-shipping threshold. */
export function shippingFeeFor(
  settings: StoreSettings,
  subtotal: number,
): number {
  if (settings.shippingFee <= 0) return 0;
  if (
    settings.freeShippingThreshold > 0 &&
    subtotal >= settings.freeShippingThreshold
  ) {
    return 0;
  }
  return settings.shippingFee;
}
