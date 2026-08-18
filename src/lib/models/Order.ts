import { Schema, model, models, Types, type Model } from "mongoose";

export type OrderStatus = "pending" | "paid" | "failed" | "cancelled";

export interface IOrderItem {
  productId: string;
  slug: string;
  name: string;
  image?: string;
  /** unit price in NGN (naira, not kobo) */
  price: number;
  quantity: number;
  size?: string;
  color?: string;
}

export interface IOrder {
  _id: string;
  reference: string;
  user?: Types.ObjectId | null;
  email: string;
  items: IOrderItem[];
  /** total in NGN (naira) */
  amount: number;
  currency: "NGN";
  status: OrderStatus;
  customer: { name: string; phone: string };
  shipping: {
    address: string;
    city: string;
    state: string;
    note?: string;
  };
  paidAt?: Date | null;
  paystack?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    productId: { type: String, required: true },
    slug: { type: String, required: true },
    name: { type: String, required: true },
    image: { type: String },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    size: { type: String },
    color: { type: String },
  },
  { _id: false },
);

const OrderSchema = new Schema<IOrder>(
  {
    reference: { type: String, required: true, unique: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: "User", default: null },
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    items: { type: [OrderItemSchema], required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: "NGN" },
    status: {
      type: String,
      enum: ["pending", "paid", "failed", "cancelled"],
      default: "pending",
      index: true,
    },
    customer: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
    },
    shipping: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      note: { type: String },
    },
    paidAt: { type: Date, default: null },
    paystack: { type: Schema.Types.Mixed },
  },
  { timestamps: true },
);

export const Order: Model<IOrder> =
  (models.Order as Model<IOrder>) || model<IOrder>("Order", OrderSchema);
