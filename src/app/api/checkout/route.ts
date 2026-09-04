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
import { canFulfill, isSoldOut, unitsLeft } from "@/lib/stock";
import { priceForSize } from "@/lib/money";
import { nextOrderNumber } from "@/lib/models/Counter";
import { getSettings, shippingFeeFor } from "@/lib/settings";
import { paystackInitialize } from "@/lib/paystack";
import { getStoreCredit } from "@/lib/store-credit";
import { markOrderPaid } from "@/lib/orders";

export const runtime = "nodejs";

const checkoutSchema = z.object({
  email: z.string().email().optional(),
  couponCode: z.string().optional(),
  useStoreCredit: z.boolean().optional(),
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
    // Never sell more than we have. Made-to-order items are unlimited.
    if (isSoldOut(product)) {
      return NextResponse.json(
        { error: `"${product.name}" is sold out.` },
        { status: 409 },
      );
    }
    if (!canFulfill(product, line.quantity)) {
      const left = unitsLeft(product) ?? 0;
      return NextResponse.json(
        {
          error: `Only ${left} of "${product.name}" left. Please lower the quantity.`,
        },
        { status: 409 },
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

  // Store credit (signed-in customers only). Applied up to the order total.
  let storeCreditApplied = 0;
  if (parsed.data.useStoreCredit && session?.user?.id) {
    const balance = await getStoreCredit(session.user.id);
    storeCreditApplied = Math.min(balance, amount);
  }
  const amountToPay = Math.max(0, amount - storeCreditApplied);

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
      storeCreditApplied,
      currency: "NGN",
      status: "pending",
      customer,
      shipping,
    });

    // Store credit covers the whole order — no card payment needed.
    if (amountToPay <= 0) {
      await markOrderPaid(reference);
      return NextResponse.json({ paid: true, reference });
    }

    const { authorizationUrl } = await paystackInitialize({
      email,
      amountNaira: amountToPay,
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
