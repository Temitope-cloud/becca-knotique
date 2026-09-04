import { Schema, model, models, Types, type Model } from "mongoose";

export type StoreCreditReason =
  | "refund" // credit issued from a refund
  | "spend" // credit used at checkout
  | "reversal" // reserved credit returned after a failed/cancelled order
  | "adjustment"; // manual admin adjustment

export interface IStoreCreditEntry {
  _id: string;
  user: Types.ObjectId;
  /** signed amount in NGN (positive = credit added, negative = credit used) */
  amount: number;
  reason: StoreCreditReason;
  description?: string;
  /** related order number/reference, when applicable */
  orderRef?: string;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const StoreCreditEntrySchema = new Schema<IStoreCreditEntry>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    amount: { type: Number, required: true },
    reason: {
      type: String,
      enum: ["refund", "spend", "reversal", "adjustment"],
      required: true,
    },
    description: { type: String },
    orderRef: { type: String, index: true },
    createdBy: { type: String },
  },
  { timestamps: true },
);

export const StoreCreditEntry: Model<IStoreCreditEntry> =
  (models.StoreCreditEntry as Model<IStoreCreditEntry>) ||
  model<IStoreCreditEntry>("StoreCreditEntry", StoreCreditEntrySchema);
