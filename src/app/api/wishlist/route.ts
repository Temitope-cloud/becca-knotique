import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/lib/models/User";

export const runtime = "nodejs";

async function currentUserFilter() {
  const session = await auth();
  if (!session?.user?.email) return null;
  return { email: session.user.email.toLowerCase() };
}

export async function GET() {
  const filter = await currentUserFilter();
  if (!filter) return NextResponse.json({ slugs: [] });
  await connectToDatabase();
  const user = await User.findOne(filter).select("wishlist").lean();
  return NextResponse.json({ slugs: user?.wishlist ?? [] });
}

export async function POST(request: Request) {
  const filter = await currentUserFilter();
  if (!filter) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }
  const body = await request.json().catch(() => ({}));
  const slug = typeof body?.slug === "string" ? body.slug.trim() : "";
  if (!slug) return NextResponse.json({ error: "Missing slug" }, { status: 400 });

  await connectToDatabase();
  await User.updateOne(filter, { $addToSet: { wishlist: slug } });
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const filter = await currentUserFilter();
  if (!filter) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }
  const body = await request.json().catch(() => ({}));
  const slug = typeof body?.slug === "string" ? body.slug.trim() : "";
  if (!slug) return NextResponse.json({ error: "Missing slug" }, { status: 400 });

  await connectToDatabase();
  await User.updateOne(filter, { $pull: { wishlist: slug } });
  return NextResponse.json({ ok: true });
}
