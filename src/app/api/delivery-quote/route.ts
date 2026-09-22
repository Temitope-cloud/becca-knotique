import { NextResponse } from "next/server";
import { z } from "zod";
import { getSettings } from "@/lib/settings";
import { deliveryQuoteFor } from "@/lib/delivery";

const schema = z.object({ city: z.string().min(2).max(80), state: z.string().min(2).max(80), subtotal: z.number().min(0) });
export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Enter a city and state to see delivery." }, { status: 400 });
  const settings = await getSettings();
  return NextResponse.json(await deliveryQuoteFor(settings, parsed.data.city, parsed.data.state, parsed.data.subtotal));
}
