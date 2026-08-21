import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireAdmin } from "@/lib/admin-auth";
import { getProductById } from "@/lib/catalog";
import ProductForm from "@/components/admin/ProductForm";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) notFound();

  return (
    <div className="px-5 py-8 sm:px-8">
      <Link
        href="/admin/products"
        className="inline-flex items-center gap-2 text-sm font-medium text-stone-500 hover:text-stone-900"
      >
        <ArrowLeft className="h-4 w-4" /> Back to products
      </Link>
      <h1 className="mt-4 mb-6 text-2xl font-semibold tracking-tight text-stone-900">
        Edit product
      </h1>
      <ProductForm
        product={{
          id: product.id,
          name: product.name,
          slug: product.slug,
          subtitle: product.subtitle,
          category: product.category,
          madefor: product.madefor as "women" | "men" | "unisex" | undefined,
          infos: product.infos,
          price: product.price,
          oldPrice: product.oldPrice,
          sizePrices: product.sizePrices,
          description: product.description,
          longDescription: product.longDescription,
          images: product.images,
          sizes: product.sizes,
          colors: product.colors,
          stockCount: product.stockCount,
          inStock: product.inStock,
          featured: product.featured,
          active: product.active,
        }}
      />
    </div>
  );
}
