import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireAdmin } from "@/lib/admin-auth";
import { getCategories } from "@/lib/catalog";
import ProductForm from "@/components/admin/ProductForm";

export default async function NewProductPage() {
  await requireAdmin();
  const categories = await getCategories();
  return (
    <div className="px-5 py-8 sm:px-8">
      <Link
        href="/admin/products"
        className="inline-flex items-center gap-2 text-sm font-medium text-stone-500 hover:text-stone-900"
      >
        <ArrowLeft className="h-4 w-4" /> Back to products
      </Link>
      <h1 className="mt-4 mb-6 text-2xl font-semibold tracking-tight text-stone-900">
        New product
      </h1>
      <ProductForm categories={categories} />
    </div>
  );
}
