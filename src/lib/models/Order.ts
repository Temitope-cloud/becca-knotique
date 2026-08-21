import { Schema, model, models, Types, type Model } from "mongoose";

export type OrderStatus = "pending" | "paid" | "failed" | "cancelled";
export type FulfillmentStatus =
  | "unfulfilled"
  | "processing"
  | "shipped"
  | "delivered";

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
  /** Short, customer-facing order number, e.g. "BK-1042". */
  orderNumber?: string;
  user?: Types.ObjectId | null;
  email: string;
  items: IOrderItem[];
  /** items total before discount (NGN) */
  subtotal: number;
  discount: number;
  couponCode?: string | null;
  shippingFee: number;
  /** amount actually charged in NGN (subtotal - discount + shippingFee) */
  amount: number;
  currency: "NGN";
  status: OrderStatus;
  fulfillmentStatus: FulfillmentStatus;
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
    orderNumber: { type: String, unique: true, sparse: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: "User", default: null },
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    items: { type: [OrderItemSchema], required: true },
    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    couponCode: { type: String, default: null },
    shippingFee: { type: Number, default: 0 },
    amount: { type: Number, required: true },
    currency: { type: String, default: "NGN" },
    status: {
      type: String,
      enum: ["pending", "paid", "failed", "cancelled"],
      default: "pending",
      index: true,
    },
    fulfillmentStatus: {
      type: String,
      enum: ["unfulfilled", "processing", "shipped", "delivered"],
      default: "unfulfilled",
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
