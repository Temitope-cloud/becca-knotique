import { Schema, model, models, Types, type Model } from "mongoose";

export type FinanceType =
  | "revenue"
  | "paystack_fee"
  | "cogs"
  | "expense"
  | "salary"
  | "drawing"
  | "tax_provision"
  | "tax_payment"
  | "refund"
  | "other_income"
  | "other_expense";

export type FinanceSource = "order" | "manual" | "system";

export interface IFinanceTransaction {
  _id: string;
  date: Date;
  description: string;
  type: FinanceType;
  /** signed amount in NGN (positive = money in, negative = money out) */
  amount: number;
  category?: string;
  /** external reference, e.g. an order number or Paystack ref */
  reference?: string;
  source: FinanceSource;
  order?: Types.ObjectId | null;
  notes?: string;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const FinanceTransactionSchema = new Schema<IFinanceTransaction>(
  {
    date: { type: Date, required: true, default: Date.now, index: true },
    description: { type: String, required: true, trim: true },
    type: {
      type: String,
      required: true,
      enum: [
        "revenue",
        "paystack_fee",
        "cogs",
        "expense",
        "salary",
        "drawing",
        "tax_provision",
        "tax_payment",
        "refund",
        "other_income",
        "other_expense",
      ],
      index: true,
    },
    amount: { type: Number, required: true },
    category: { type: String },
    reference: { type: String, index: true },
    source: {
      type: String,
      enum: ["order", "manual", "system"],
      default: "manual",
      index: true,
    },
    order: { type: Schema.Types.ObjectId, ref: "Order", default: null },
    notes: { type: String },
    createdBy: { type: String },
  },
  { timestamps: true },
);

// Prevent duplicate auto-generated entries per order+type (idempotent sales sync).
FinanceTransactionSchema.index(
  { order: 1, type: 1 },
  { unique: true, partialFilterExpression: { source: "order" } },
);

export const FinanceTransaction: Model<IFinanceTransaction> =
  (models.FinanceTransaction as Model<IFinanceTransaction>) ||
  model<IFinanceTransaction>("FinanceTransaction", FinanceTransactionSchema);
