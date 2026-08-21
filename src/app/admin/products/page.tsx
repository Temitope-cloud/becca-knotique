import Link from "next/link";
import Image from "next/image";
import { Plus, Package, Star } from "lucide-react";
import { requireAdmin } from "@/lib/admin-auth";
import { getAllProducts } from "@/lib/catalog";
import { formatNaira } from "@/lib/money";

type Filter = "all" | "featured" | "active" | "hidden";

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  await requireAdmin();
  const { filter: rawFilter } = await searchParams;
  const filter: Filter = (
    ["all", "featured", "active", "hidden"].includes(rawFilter ?? "")
      ? rawFilter
      : "all"
  ) as Filter;

  const all = await getAllProducts({ includeInactive: true });

  const counts = {
    all: all.length,
    featured: all.filter((p) => p.featured).length,
    active: all.filter((p) => p.active).length,
    hidden: all.filter((p) => !p.active).length,
  };

  const products =
    filter === "featured"
      ? all.filter((p) => p.featured)
      : filter === "active"
        ? all.filter((p) => p.active)
        : filter === "hidden"
          ? all.filter((p) => !p.active)
          : all;

  const tabs: { key: Filter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "featured", label: "Featured" },
    { key: "active", label: "Active" },
    { key: "hidden", label: "Hidden" },
  ];

  return (
    <div className="px-5 py-8 sm:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-stone-900">
            Products
          </h1>
          <p className="mt-1 text-sm text-stone-500">
            {counts.all} product{counts.all === 1 ? "" : "s"} in your catalog
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 rounded-xl bg-stone-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-stone-800"
        >
          <Plus className="h-4 w-4" /> Add product
        </Link>
      </div>

      {/* filter pills */}
      <div className="mt-6 flex flex-wrap gap-2">
        {tabs.map((t) => {
          const isActive = filter === t.key;
          return (
            <Link
              key={t.key}
              href={t.key === "all" ? "/admin/products" : `/admin/products?filter=${t.key}`}
              className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition ${
                isActive
                  ? "bg-stone-900 text-white"
                  : "border border-stone-300 bg-white text-stone-600 hover:border-stone-400"
              }`}
            >
              {t.key === "featured" ? (
                <Star
                  className={`h-3.5 w-3.5 ${isActive ? "fill-white" : "fill-amber-400 text-amber-400"}`}
                />
              ) : null}
              {t.label}
              <span
                className={`rounded-full px-1.5 text-xs ${
                  isActive ? "bg-white/20" : "bg-stone-100 text-stone-500"
                }`}
              >
                {counts[t.key]}
              </span>
            </Link>
          );
        })}
      </div>

      {products.length === 0 ? (
        <div className="mt-6 flex flex-col items-center rounded-2xl border border-dashed border-stone-300 bg-white px-6 py-16 text-center">
          <Package className="h-10 w-10 text-stone-300" />
          <p className="mt-4 text-stone-600">
            {filter === "featured"
              ? "No featured products yet. Open a product and toggle 'Featured' to spotlight it on the homepage."
              : "No products here."}
          </p>
          <Link
            href="/admin/products/new"
            className="mt-6 rounded-xl bg-stone-900 px-5 py-2.5 text-sm font-semibold text-white"
          >
            Add a product
          </Link>
        </div>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-2xl border border-stone-200 bg-white">
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
                        <span className="flex items-center gap-1.5 font-medium text-stone-900">
                          {p.name}
                          {p.featured ? (
                            <Star
                              className="h-3.5 w-3.5 shrink-0 fill-amber-400 text-amber-400"
                              aria-label="Featured"
                            />
                          ) : null}
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
