import { Schema, model, models, type Model } from "mongoose";

export interface INewsletterSubscriber {
  _id: string;
  email: string;
  consentedAt: Date;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NewsletterSubscriberSchema = new Schema<INewsletterSubscriber>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    consentedAt: { type: Date, required: true },
    active: { type: Boolean, default: true, index: true },
  },
  { timestamps: true },
);

export const NewsletterSubscriber: Model<INewsletterSubscriber> =
  (models.NewsletterSubscriber as Model<INewsletterSubscriber>) ||
  model<INewsletterSubscriber>("NewsletterSubscriber", NewsletterSubscriberSchema);
