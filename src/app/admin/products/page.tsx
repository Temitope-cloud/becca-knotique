import Link from "next/link";
import Image from "next/image";
import { Plus, Package } from "lucide-react";
import { requireAdmin } from "@/lib/admin-auth";
import { getAllProducts } from "@/lib/catalog";
import { formatNaira } from "@/lib/money";

export default async function AdminProductsPage() {
  await requireAdmin();
  const products = await getAllProducts({ includeInactive: true });

  return (
    <div className="px-5 py-8 sm:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-stone-900">
            Products
          </h1>
          <p className="mt-1 text-sm text-stone-500">
            {products.length} product{products.length === 1 ? "" : "s"} in your
            catalog
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 rounded-xl bg-stone-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-stone-800"
        >
          <Plus className="h-4 w-4" /> Add product
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="mt-8 flex flex-col items-center rounded-2xl border border-dashed border-stone-300 bg-white px-6 py-16 text-center">
          <Package className="h-10 w-10 text-stone-300" />
          <p className="mt-4 text-stone-600">No products yet.</p>
          <Link
            href="/admin/products/new"
            className="mt-6 rounded-xl bg-stone-900 px-5 py-2.5 text-sm font-semibold text-white"
          >
            Add your first product
          </Link>
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-2xl border border-stone-200 bg-white">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-stone-200 bg-stone-50 text-xs tracking-wide text-stone-500 uppercase">
              <tr>
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Stock</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const cover = p.images?.[0] ?? p.image;
                return (
                  <tr
                    key={p.id}
                    className="border-b border-stone-100 last:border-0"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative h-12 w-10 shrink-0 overflow-hidden rounded-md bg-stone-100">
                          {cover ? (
                            <Image
                              src={cover}
                              alt=""
                              fill
                              sizes="40px"
                              className="object-cover"
                            />
                          ) : null}
                        </div>
                        <span className="font-medium text-stone-900">
                          {p.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-stone-500 capitalize">
                      {p.category || "—"}
                    </td>
                    <td className="px-4 py-3 font-medium whitespace-nowrap text-stone-900">
                      {formatNaira(p.price)}
                    </td>
                    <td className="px-4 py-3 text-stone-600">
                      {p.stockCount ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          p.active
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-stone-200 text-stone-600"
                        }`}
                      >
                        {p.active ? "Active" : "Hidden"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/products/${p.id}`}
                        className="text-sm font-medium text-stone-600 hover:text-stone-900 hover:underline"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
