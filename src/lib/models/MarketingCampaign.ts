import { Schema, model, models, type Model } from "mongoose";

export interface IMarketingCampaign {
  _id: string;
  subject: string;
  previewText?: string;
  content: string;
  audience: "all_opted_in" | "newsletter" | "customers";
  status: "draft" | "sent";
  recipientCount: number;
  sentAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const MarketingCampaignSchema = new Schema<IMarketingCampaign>(
  {
    subject: { type: String, required: true, trim: true, maxlength: 160 },
    previewText: { type: String, maxlength: 240 },
    content: { type: String, required: true, maxlength: 20000 },
    audience: { type: String, enum: ["all_opted_in", "newsletter", "customers"], default: "all_opted_in" },
    status: { type: String, enum: ["draft", "sent"], default: "draft", index: true },
    recipientCount: { type: Number, default: 0 },
    sentAt: { type: Date },
  },
  { timestamps: true },
);

export const MarketingCampaign: Model<IMarketingCampaign> =
  (models.MarketingCampaign as Model<IMarketingCampaign>) ||
  model<IMarketingCampaign>("MarketingCampaign", MarketingCampaignSchema);
