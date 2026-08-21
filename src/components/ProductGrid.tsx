"use client";

import type { CatalogProduct } from "@/lib/catalog";
import ProductCard from "@/components/ProductCard";

export default function ProductGrid({
  products,
}: {
  products: CatalogProduct[];
}) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
