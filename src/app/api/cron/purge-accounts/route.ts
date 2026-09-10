import { NextResponse } from "next/server";
import { purgeDueAccounts } from "@/lib/account-deletion";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * Daily job (Vercel Cron) that permanently removes accounts whose 30-day
 * deletion grace period has elapsed. Protected by CRON_SECRET: Vercel sends it
 * as `Authorization: Bearer <CRON_SECRET>` automatically when the env var is
 * set. Refuses to run if the secret isn't configured, so the endpoint can never
 * be triggered anonymously.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "CRON_SECRET is not configured." },
      { status: 500 },
    );
  }
  if (request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const purged = await purgeDueAccounts();
  return NextResponse.json({ ok: true, purged });
}
