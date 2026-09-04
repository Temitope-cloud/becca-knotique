import { Schema, model, models, Types, type Model } from "mongoose";

export type RefundRequestStatus = "pending" | "approved" | "declined";

export interface IRefundRequest {
  _id: string;
  order: Types.ObjectId;
  orderNumber: string;
  orderReference: string;
  user?: Types.ObjectId | null;
  email: string;
  /** amount the customer is asking for (NGN); defaults to the refundable total */
  amount: number;
  reason: string;
  note?: string;
  photos: string[];
  status: RefundRequestStatus;
  /** admin's note when approving/declining */
  adminNote?: string;
  resolvedBy?: string;
  resolvedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const RefundRequestSchema = new Schema<IRefundRequest>(
  {
    order: { type: Schema.Types.ObjectId, ref: "Order", required: true, index: true },
    orderNumber: { type: String, required: true },
    orderReference: { type: String, required: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: "User", default: null, index: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    amount: { type: Number, required: true },
    reason: { type: String, required: true },
    note: { type: String },
    photos: { type: [String], default: [] },
    status: {
      type: String,
      enum: ["pending", "approved", "declined"],
      default: "pending",
      index: true,
    },
    adminNote: { type: String },
    resolvedBy: { type: String },
    resolvedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

export const RefundRequest: Model<IRefundRequest> =
  (models.RefundRequest as Model<IRefundRequest>) ||
  model<IRefundRequest>("RefundRequest", RefundRequestSchema);
