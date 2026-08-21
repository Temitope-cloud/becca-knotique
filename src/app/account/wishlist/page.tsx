import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { Heart, ArrowLeft, ArrowRight } from "lucide-react";
import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/lib/models/User";
import { getProductsBySlugs } from "@/lib/catalog";
import ProductGrid from "@/components/ProductGrid";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "My wishlist",
  robots: { index: false, follow: false },
};

export default async function WishlistPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=/account/wishlist");
  }

  await connectToDatabase();
  const user = await User.findOne({
    email: session.user.email?.toLowerCase(),
  })
    .select("wishlist")
    .lean();

  const products = await getProductsBySlugs(user?.wishlist ?? []);

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6">
      <Link
        href="/account"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-stone-500 hover:text-stone-900"
      >
        <ArrowLeft className="h-4 w-4" /> Back to account
      </Link>

      <h1 className="mt-4 flex items-center gap-2 text-3xl font-semibold tracking-tight text-stone-900">
        <Heart className="h-6 w-6 fill-rose-500 text-rose-500" /> My wishlist
      </h1>

      {products.length === 0 ? (
        <div className="mt-8 flex flex-col items-center rounded-3xl border border-dashed border-stone-300 bg-white px-6 py-20 text-center">
          <Heart className="h-10 w-10 text-stone-300" />
          <p className="mt-3 text-lg font-semibold text-stone-900">
            Nothing saved yet
          </p>
          <p className="mt-1 text-sm text-stone-500">
            Tap the heart on any piece to save it here for later.
          </p>
          <Link
            href="/products"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-stone-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-stone-800"
          >
            Browse products <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <div className="mt-8">
          <ProductGrid products={products} />
        </div>
      )}
    </main>
  );
}
