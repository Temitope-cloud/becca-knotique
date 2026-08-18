import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { z } from "zod";
import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/db";
import { Order, type IOrderItem } from "@/lib/models/Order";
import { products } from "@/data/Products";
import { paystackInitialize } from "@/lib/paystack";

export const runtime = "nodejs";

const checkoutSchema = z.object({
  email: z.string().email().optional(),
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
        productId: z.string(),
        size: z.string().optional(),
        color: z.string().optional(),
        quantity: z.number().int().min(1).max(20),
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
      {
        error: "Please check your details.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  const { customer, shipping, items } = parsed.data;

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

  // Recompute line items and totals from the trusted server-side catalog —
  // never trust prices sent by the browser.
  const orderItems: IOrderItem[] = [];
  for (const line of items) {
    const product = products.find((p) => p.id === line.productId);
    if (!product) {
      return NextResponse.json(
        { error: `A product in your cart is no longer available.` },
        { status: 400 },
      );
    }
    orderItems.push({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: product.images?.[0] ?? product.image,
      price: product.price,
      quantity: line.quantity,
      size: line.size,
      color: line.color,
    });
  }

  const amount = orderItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  if (amount <= 0) {
    return NextResponse.json({ error: "Invalid order total." }, { status: 400 });
  }

  const reference = `bk_${Date.now()}_${randomUUID().slice(0, 8)}`;

  try {
    await connectToDatabase();

    await Order.create({
      reference,
      user: session?.user?.id ?? null,
      email,
      items: orderItems,
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
      metadata: {
        reference,
        customerName: customer.name,
        phone: customer.phone,
      },
    });

    return NextResponse.json({ authorizationUrl, reference });
  } catch (error) {
    console.error("[checkout] error:", error);
    const message =
      error instanceof Error ? error.message : "Could not start checkout.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
