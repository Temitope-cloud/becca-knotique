import Link from "next/link";
import Image from "next/image";
import { Plus, Package, Star, Trash2 } from "lucide-react";
import { requireAdmin } from "@/lib/admin-auth";
import { getAllProducts, type CatalogProduct } from "@/lib/catalog";
import { formatNaira } from "@/lib/money";
import TrashRowActions from "@/components/admin/TrashRowActions";

type Filter = "all" | "featured" | "draft" | "hidden" | "trash";

function statusOf(p: CatalogProduct): { label: string; cls: string } {
  if (p.status === "draft")
    return { label: "Draft", cls: "bg-amber-100 text-amber-800" };
  if (!p.active) return { label: "Hidden", cls: "bg-stone-200 text-stone-600" };
  return { label: "Active", cls: "bg-emerald-100 text-emerald-800" };
}

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  await requireAdmin();
  const { filter: rawFilter } = await searchParams;
  const filter: Filter = (
    ["all", "featured", "draft", "hidden", "trash"].includes(rawFilter ?? "")
      ? rawFilter
      : "all"
  ) as Filter;

  const [live, trashed] = await Promise.all([
    getAllProducts({ includeInactive: true }),
    getAllProducts({ trashedOnly: true }),
  ]);

  const counts = {
    all: live.length,
    featured: live.filter((p) => p.featured).length,
    draft: live.filter((p) => p.status === "draft").length,
    hidden: live.filter((p) => !p.active && p.status !== "draft").length,
    trash: trashed.length,
  };

  const isTrash = filter === "trash";
  const products = isTrash
    ? trashed
    : filter === "featured"
      ? live.filter((p) => p.featured)
      : filter === "draft"
        ? live.filter((p) => p.status === "draft")
        : filter === "hidden"
          ? live.filter((p) => !p.active && p.status !== "draft")
          : live;

  const tabs: { key: Filter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "featured", label: "Featured" },
    { key: "draft", label: "Draft" },
    { key: "hidden", label: "Hidden" },
    { key: "trash", label: "Trash" },
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
              href={
                t.key === "all"
                  ? "/admin/products"
                  : `/admin/products?filter=${t.key}`
              }
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
              {t.key === "trash" ? <Trash2 className="h-3.5 w-3.5" /> : null}
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
            {isTrash
              ? "Trash is empty."
              : filter === "draft"
                ? "No drafts. Use 'Save as draft' on a product to keep it here until it's ready."
                : filter === "featured"
                  ? "No featured products yet."
                  : "No products here."}
          </p>
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
                <th className="px-4 py-3 font-medium">
                  {isTrash ? "Trashed" : "Status"}
                </th>
                <th className="px-4 py-3 font-medium text-right">
                  {isTrash ? "Actions" : ""}
                </th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const cover = p.images?.[0] ?? p.image;
                const st = statusOf(p);
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
                          {p.featured && !isTrash ? (
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
                      {isTrash ? (
                        <span className="text-xs text-stone-400">In trash</span>
                      ) : (
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${st.cls}`}
                        >
                          {st.label}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {isTrash ? (
                        <TrashRowActions id={p.id} />
                      ) : (
                        <Link
                          href={`/admin/products/${p.id}`}
                          className="text-sm font-medium text-stone-600 hover:text-stone-900 hover:underline"
                        >
                          Edit
                        </Link>
                      )}
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
