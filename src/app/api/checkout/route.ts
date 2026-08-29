import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { z } from "zod";
import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/db";
import { Order, type IOrderItem } from "@/lib/models/Order";
import { Coupon, computeCouponDiscount } from "@/lib/models/Coupon";
import {
  getProductById,
  getProductBySlug,
  isStorefrontVisible,
} from "@/lib/catalog";
import { priceForSize } from "@/lib/money";
import { nextOrderNumber } from "@/lib/models/Counter";
import { getSettings, shippingFeeFor } from "@/lib/settings";
import { paystackInitialize } from "@/lib/paystack";

export const runtime = "nodejs";

const checkoutSchema = z.object({
  email: z.string().email().optional(),
  couponCode: z.string().optional(),
  customer: z.object({
    name: z.string().min(2).max(80),
    phone: z.string().min(7).max(20),
  }),
  shipping: z.object({
    address: z.string().min(4).max(200),
    city: z.string().min(2).max(80),
    state: z.string().min(2).max(80),
    note: z.string().max(500).optional(),
  }),
  items: z
    .array(
      z.object({
        productId: z.string().optional(),
        slug: z.string().optional(),
        size: z.string().optional(),
        color: z.string().optional(),
        quantity: z.number().int().min(1).max(20),
        measurements: z
          .array(
            z.object({
              label: z.string().max(60),
              value: z.string().max(60),
            }),
          )
          .max(12)
          .optional(),
        customColor: z.string().max(200).optional(),
        referenceImage: z.string().url().max(600).optional(),
      }),
    )
    .min(1, "Your cart is empty."),
});

function baseUrl(request: Request): string {
  return (
    process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, "") ||
    new URL(request.url).origin
  );
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please check your details.", fieldErrors: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const { customer, shipping, items, couponCode } = parsed.data;

  const session = await auth();
  const email = (session?.user?.email || parsed.data.email || "")
    .toLowerCase()
    .trim();
  if (!email) {
    return NextResponse.json(
      { error: "An email is required to check out." },
      { status: 400 },
    );
  }

  // Recompute every line from the trusted catalog (never trust client prices).
  const orderItems: IOrderItem[] = [];
  for (const line of items) {
    const product =
      (line.slug ? await getProductBySlug(line.slug) : null) ??
      (line.productId ? await getProductById(line.productId) : null);
    if (!product || !isStorefrontVisible(product)) {
      return NextResponse.json(
        { error: "A product in your cart is no longer available." },
        { status: 400 },
      );
    }
    orderItems.push({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: product.images?.[0] ?? product.image,
      price: priceForSize(product.price, product.sizePrices, line.size),
      quantity: line.quantity,
      size: line.size,
      color: line.color,
      measurements: line.measurements?.length ? line.measurements : undefined,
      customColor: line.customColor || undefined,
      referenceImage: line.referenceImage || undefined,
    });
  }

  const subtotal = orderItems.reduce((s, i) => s + i.price * i.quantity, 0);
  if (subtotal <= 0) {
    return NextResponse.json({ error: "Invalid order total." }, { status: 400 });
  }

  await connectToDatabase();

  // Coupon (validated server-side)
  let discount = 0;
  let appliedCoupon: string | null = null;
  if (couponCode) {
    const coupon = await Coupon.findOne({
      code: couponCode.toUpperCase().trim(),
    }).lean();
    if (coupon) {
      const evaln = computeCouponDiscount(coupon, subtotal);
      if (evaln.valid) {
        discount = evaln.discount;
        appliedCoupon = coupon.code;
      }
    }
  }

  const settings = await getSettings();
  const shippingFee = shippingFeeFor(settings, subtotal);
  const amount = Math.max(0, subtotal - discount) + shippingFee;

  const reference = `bk_${Date.now()}_${randomUUID().slice(0, 8)}`;

  try {
    const orderNumber = await nextOrderNumber();
    await Order.create({
      reference,
      orderNumber,
      user: session?.user?.id ?? null,
      email,
      items: orderItems,
      subtotal,
      discount,
      couponCode: appliedCoupon,
      shippingFee,
      amount,
      currency: "NGN",
      status: "pending",
      customer,
      shipping,
    });

    const { authorizationUrl } = await paystackInitialize({
      email,
      amountNaira: amount,
      reference,
      callbackUrl: `${baseUrl(request)}/order/callback`,
      metadata: { reference, customerName: customer.name, phone: customer.phone },
    });

    return NextResponse.json({ authorizationUrl, reference });
  } catch (error) {
    console.error("[checkout] error:", error);
    const message =
      error instanceof Error ? error.message : "Could not start checkout.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
