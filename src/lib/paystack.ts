import "server-only";
import { nairaToKobo } from "./money";

const PAYSTACK_BASE = "https://api.paystack.co";

function secretKey(): string {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) {
    throw new Error(
      "PAYSTACK_SECRET_KEY is not set. Add it to .env.local to accept payments.",
    );
  }
  return key;
}

export interface PaystackInitParams {
  email: string;
  /** amount in NGN (naira) — converted to kobo internally */
  amountNaira: number;
  reference: string;
  callbackUrl: string;
  metadata?: Record<string, unknown>;
}

export interface PaystackInitResult {
  authorizationUrl: string;
  accessCode: string;
  reference: string;
}

/** Initialize a transaction and get the checkout URL to redirect the buyer to. */
export async function paystackInitialize(
  params: PaystackInitParams,
): Promise<PaystackInitResult> {
  const res = await fetch(`${PAYSTACK_BASE}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: params.email,
      amount: nairaToKobo(params.amountNaira),
      reference: params.reference,
      callback_url: params.callbackUrl,
      currency: "NGN",
      metadata: params.metadata ?? {},
    }),
    cache: "no-store",
  });

  const json = await res.json();
  if (!res.ok || !json.status) {
    throw new Error(json?.message || "Failed to initialize Paystack transaction");
  }

  return {
    authorizationUrl: json.data.authorization_url,
    accessCode: json.data.access_code,
    reference: json.data.reference,
  };
}

export interface PaystackVerifyResult {
  status: string; // "success" | "failed" | ...
  reference: string;
  amount: number; // kobo
  raw: Record<string, unknown>;
}

/** Verify a transaction by reference. Source of truth for whether an order was paid. */
export async function paystackVerify(
  reference: string,
): Promise<PaystackVerifyResult> {
  const res = await fetch(
    `${PAYSTACK_BASE}/transaction/verify/${encodeURIComponent(reference)}`,
    {
      headers: { Authorization: `Bearer ${secretKey()}` },
      cache: "no-store",
    },
  );

  const json = await res.json();
  if (!res.ok || !json.status) {
    throw new Error(json?.message || "Failed to verify Paystack transaction");
  }

  return {
    status: json.data.status,
    reference: json.data.reference,
    amount: json.data.amount,
    raw: json.data,
  };
}
