import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getStoreCredit } from "@/lib/store-credit";

export const runtime = "nodejs";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ balance: 0 });
  }
  const balance = await getStoreCredit(session.user.id);
  return NextResponse.json({ balance });
}
