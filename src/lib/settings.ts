import "server-only";
import { connectToDatabase } from "@/lib/db";
import { Settings, type ISettings } from "@/lib/models/Settings";

export interface StoreSettings {
  storeName: string;
  supportEmail: string;
  supportPhone: string;
  announcement: string;
  shippingFee: number;
  freeShippingThreshold: number;
}

const defaults: StoreSettings = {
  storeName: "Becca's Knotique",
  supportEmail: "",
  supportPhone: "2348029086678",
  announcement: "",
  shippingFee: 0,
  freeShippingThreshold: 0,
};

export async function getSettings(): Promise<StoreSettings> {
  try {
    await connectToDatabase();
    const doc = await Settings.findOne({ key: "store" }).lean<ISettings>();
    if (!doc) return defaults;
    return {
      storeName: doc.storeName ?? defaults.storeName,
      supportEmail: doc.supportEmail ?? "",
      supportPhone: doc.supportPhone ?? defaults.supportPhone,
      announcement: doc.announcement ?? "",
      shippingFee: doc.shippingFee ?? 0,
      freeShippingThreshold: doc.freeShippingThreshold ?? 0,
    };
  } catch {
    return defaults;
  }
}

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
