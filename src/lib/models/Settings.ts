import { Schema, model, models, type Model } from "mongoose";

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
  },
  { timestamps: true },
);

export const Settings: Model<ISettings> =
  (models.Settings as Model<ISettings>) ||
  model<ISettings>("Settings", SettingsSchema);
