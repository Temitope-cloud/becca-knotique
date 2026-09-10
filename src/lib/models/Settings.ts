import { Schema, model, models, type Model } from "mongoose";

export interface ISettingsPolicies {
  privacy?: string;
  terms?: string;
  refund?: string;
  disclaimer?: string;
}

export interface ISettings {
  _id: string;
  key: string;
  storeName: string;
  supportEmail?: string;
  supportPhone?: string;
  announcement?: string;
  /** flat delivery fee in NGN (0 = arranged after checkout) */
  shippingFee: number;
  /** order subtotal at/above which shipping is free (0 = disabled) */
  freeShippingThreshold: number;
  // Contact & social
  address?: string;
  instagram?: string;
  tiktok?: string;
  whatsapp?: string;
  foundedYear?: string;
  // SEO defaults
  metaTitle?: string;
  metaDescription?: string;
  // Policy page overrides (HTML). Empty = use the built-in page content.
  policies?: ISettingsPolicies;
  updatedAt: Date;
}

const SettingsSchema = new Schema<ISettings>(
  {
    key: { type: String, default: "store", unique: true },
    storeName: { type: String, default: "Becca's Knotique" },
    supportEmail: { type: String },
    supportPhone: { type: String, default: "2348029086678" },
    announcement: { type: String, default: "" },
    shippingFee: { type: Number, default: 0 },
    freeShippingThreshold: { type: Number, default: 0 },
    address: { type: String },
    instagram: { type: String },
    tiktok: { type: String },
    whatsapp: { type: String },
    foundedYear: { type: String },
    metaTitle: { type: String },
    metaDescription: { type: String },
    policies: {
      privacy: { type: String },
      terms: { type: String },
      refund: { type: String },
      disclaimer: { type: String },
    },
  },
  { timestamps: true },
);

export const Settings: Model<ISettings> =
  (models.Settings as Model<ISettings>) ||
  model<ISettings>("Settings", SettingsSchema);
