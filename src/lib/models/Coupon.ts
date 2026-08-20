import { Schema, model, models, type Model } from "mongoose";

export type DiscountType = "percentage" | "fixed";

export interface ICoupon {
  _id: string;
  code: string;
  type: DiscountType;
  /** percent (0-100) when type=percentage, or naira amount when type=fixed */
  value: number;
  /** minimum order subtotal (NGN) required to use the coupon */
  minOrder: number;
  /** total times this coupon may be used across all customers (0 = unlimited) */
  usageLimit: number;
  timesUsed: number;
  expiresAt?: Date | null;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CouponSchema = new Schema<ICoupon>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["percentage", "fixed"],
      default: "percentage",
    },
    value: { type: Number, required: true, min: 0 },
    minOrder: { type: Number, default: 0, min: 0 },
    usageLimit: { type: Number, default: 0, min: 0 },
    timesUsed: { type: Number, default: 0, min: 0 },
    expiresAt: { type: Date, default: null },
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const Coupon: Model<ICoupon> =
  (models.Coupon as Model<ICoupon>) || model<ICoupon>("Coupon", CouponSchema);

/** Evaluate a coupon against a subtotal. Returns discount in NGN + reason if invalid. */
export function computeCouponDiscount(
  coupon: Pick<
    ICoupon,
    "type" | "value" | "minOrder" | "usageLimit" | "timesUsed" | "expiresAt" | "active"
  >,
  subtotal: number,
): { valid: boolean; discount: number; reason?: string } {
  if (!coupon.active) return { valid: false, discount: 0, reason: "This code is inactive." };
  if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date())
    return { valid: false, discount: 0, reason: "This code has expired." };
  if (coupon.usageLimit > 0 && coupon.timesUsed >= coupon.usageLimit)
    return { valid: false, discount: 0, reason: "This code has reached its usage limit." };
  if (subtotal < coupon.minOrder)
    return {
      valid: false,
      discount: 0,
      reason: `Spend at least ₦${coupon.minOrder.toLocaleString()} to use this code.`,
    };

  const raw =
    coupon.type === "percentage"
      ? (subtotal * coupon.value) / 100
      : coupon.value;
  const discount = Math.min(Math.round(raw), subtotal);
  return { valid: true, discount };
}
