"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";
import ImageUploader from "./ImageUploader";

export interface ProductInput {
  id?: string;
  name: string;
  slug?: string;
  subtitle?: string;
  category: string;
  price: number;
  oldPrice?: number;
  sizePrices?: { size: string; price: number }[];
  description: string;
  longDescription?: string;
  images: string[];
  sizes: string[];
  colors: string[];
  stockCount?: number;
  inStock: boolean;
  featured: boolean;
  active: boolean;
}

const categories = [
  "one-piece",
  "new-collection",
  "accessories",
  "bags",
  "",
];

export default function ProductForm({ product }: { product?: ProductInput }) {
  const router = useRouter();
  const editing = Boolean(product?.id);

  const [form, setForm] = useState({
    name: product?.name ?? "",
    slug: product?.slug ?? "",
    subtitle: product?.subtitle ?? "",
    category: product?.category ?? "one-piece",
    price: product?.price?.toString() ?? "",
    oldPrice: product?.oldPrice?.toString() ?? "",
    description: product?.description ?? "",
    longDescription: product?.longDescription ?? "",
    sizes: (product?.sizes ?? []).join(", "),
    sizePrices: (product?.sizePrices ?? [])
      .map((sp) => `${sp.size}:${sp.price}`)
      .join(", "),
    colors: (product?.colors ?? []).join(", "),
    stockCount: product?.stockCount?.toString() ?? "10",
    inStock: product?.inStock ?? true,
    featured: product?.featured ?? false,
    active: product?.active ?? true,
  });
  const [images, setImages] = useState<string[]>(product?.images ?? []);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const set = (k: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) =>
    setForm((f) => ({
      ...f,
      [k]:
        e.target.type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : e.target.value,
    }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    const payload = {
      name: form.name.trim(),
      slug: form.slug.trim() || undefined,
      subtitle: form.subtitle.trim() || undefined,
      category: form.category,
      price: Number(form.price),
      oldPrice: form.oldPrice ? Number(form.oldPrice) : undefined,
      description: form.description.trim(),
      longDescription: form.longDescription.trim() || undefined,
      images,
      sizes: form.sizes.split(",").map((s) => s.trim()).filter(Boolean),
      sizePrices: form.sizePrices
        .split(",")
        .map((pair) => pair.trim())
        .filter(Boolean)
        .map((pair) => {
          const [size, price] = pair.split(":").map((x) => x.trim());
          return { size, price: Number(price) };
        })
        .filter((sp) => sp.size && Number.isFinite(sp.price) && sp.price > 0),
      colors: form.colors.split(",").map((s) => s.trim()).filter(Boolean),
      stockCount: form.stockCount ? Number(form.stockCount) : undefined,
      inStock: form.inStock,
      featured: form.featured,
      active: form.active,
    };

    try {
      const res = await fetch(
        editing ? `/api/admin/products/${product!.id}` : "/api/admin/products",
        {
          method: editing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Could not save the product.");
        setSaving(false);
        return;
      }
      router.push("/admin/products");
      router.refresh();
    } catch {
      setError("Something went wrong.");
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!editing) return;
    if (!confirm("Delete this product? This cannot be undone.")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/products/${product!.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        router.push("/admin/products");
        router.refresh();
      } else {
        setDeleting(false);
      }
    } catch {
      setDeleting(false);
    }
  }

  const input =
    "w-full rounded-xl border border-stone-300 px-3.5 py-2.5 text-sm text-stone-900 outline-none transition focus:border-stone-900 focus:ring-2 focus:ring-stone-900/10";
  const label = "mb-1.5 block text-sm font-medium text-stone-700";

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
      <div className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6">
        <h2 className="font-semibold text-stone-900">Details</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={label}>Product name</label>
            <input required value={form.name} onChange={set("name")} className={input} />
          </div>
          <div>
            <label className={label}>Slug (optional)</label>
            <input
              value={form.slug}
              onChange={set("slug")}
              placeholder="auto-generated from name"
              className={input}
            />
          </div>
          <div>
            <label className={label}>Category</label>
            <select value={form.category} onChange={set("category")} className={input}>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c || "uncategorized"}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={label}>Subtitle</label>
            <input value={form.subtitle} onChange={set("subtitle")} className={input} />
          </div>
          <div className="sm:col-span-2">
            <label className={label}>Short description</label>
            <textarea
              rows={2}
              value={form.description}
              onChange={set("description")}
              className={input}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={label}>Long description</label>
            <textarea
              rows={4}
              value={form.longDescription}
              onChange={set("longDescription")}
              className={input}
            />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6">
        <h2 className="font-semibold text-stone-900">Images</h2>
        <div className="mt-4">
          <ImageUploader value={images} onChange={setImages} />
        </div>
      </div>

      <div className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6">
        <h2 className="font-semibold text-stone-900">Pricing & stock</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className={label}>Price (₦)</label>
            <input
              required
              type="number"
              min="0"
              value={form.price}
              onChange={set("price")}
              className={input}
            />
          </div>
          <div>
            <label className={label}>Compare-at price (₦)</label>
            <input
              type="number"
              min="0"
              value={form.oldPrice}
              onChange={set("oldPrice")}
              className={input}
            />
          </div>
          <div>
            <label className={label}>Stock count</label>
            <input
              type="number"
              min="0"
              value={form.stockCount}
              onChange={set("stockCount")}
              className={input}
            />
          </div>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={label}>Sizes (comma separated)</label>
            <input
              value={form.sizes}
              onChange={set("sizes")}
              placeholder="S, M, L"
              className={input}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={label}>
              Per-size prices (optional) — overrides base price
            </label>
            <input
              value={form.sizePrices}
              onChange={set("sizePrices")}
              placeholder="S:100000, M:100000, L:110000, XL:120000"
              className={input}
            />
            <p className="mt-1 text-xs text-stone-400">
              Format: SIZE:PRICE, comma separated. Sizes not listed use the base
              price.
            </p>
          </div>
          <div>
            <label className={label}>Colors (comma separated)</label>
            <input
              value={form.colors}
              onChange={set("colors")}
              placeholder="Cream, Mocha"
              className={input}
            />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6">
        <h2 className="font-semibold text-stone-900">Visibility</h2>
        <div className="mt-4 space-y-3">
          {[
            { k: "inStock" as const, label: "In stock", desc: "Customers can buy it" },
            { k: "active" as const, label: "Active", desc: "Shown in the store" },
            { k: "featured" as const, label: "Featured", desc: "Highlighted on the homepage" },
          ].map((row) => (
            <label key={row.k} className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={form[row.k]}
                onChange={set(row.k)}
                className="h-4 w-4 rounded border-stone-300"
              />
              <span className="text-sm">
                <span className="font-medium text-stone-800">{row.label}</span>
                <span className="text-stone-400"> — {row.desc}</span>
              </span>
            </label>
          ))}
        </div>
      </div>

      {error ? (
        <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </p>
      ) : null}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-xl bg-stone-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:opacity-60"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {editing ? "Save changes" : "Create product"}
        </button>
        {editing ? (
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="inline-flex items-center gap-2 rounded-xl border border-rose-200 px-5 py-3 text-sm font-semibold text-rose-600 transition hover:bg-rose-50 disabled:opacity-60"
          >
            {deleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            Delete
          </button>
        ) : null}
      </div>
    </form>
  );
}
