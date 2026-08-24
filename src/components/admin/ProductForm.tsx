"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2, FileText } from "lucide-react";
import ImageUploader from "./ImageUploader";

type SaveStatus = "published" | "draft";

export interface ProductInput {
  id?: string;
  name: string;
  slug?: string;
  subtitle?: string;
  category: string;
  madefor?: "women" | "men" | "unisex";
  infos?: { label: string }[];
  price: number;
  oldPrice?: number;
  sizePrices?: { size: string; price: number }[];
  sizeMaterialCosts?: { size: string; cost: number }[];
  measurementFields?: { label: string; unit?: string; guide?: string }[];
  allowCustomColor?: boolean;
  description: string;
  longDescription?: string;
  images: string[];
  sizes: string[];
  colors: string[];
  stockCount?: number;
  materialCost?: number;
  packagingCost?: number;
  inStock: boolean;
  featured: boolean;
  active: boolean;
  status?: "published" | "draft";
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
    madefor: product?.madefor ?? "women",
    infos: (product?.infos ?? []).map((i) => i.label).join("\n"),
    price: product?.price?.toString() ?? "",
    oldPrice: product?.oldPrice?.toString() ?? "",
    description: product?.description ?? "",
    longDescription: product?.longDescription ?? "",
    colors: (product?.colors ?? []).join(", "),
    stockCount: product?.stockCount?.toString() ?? "10",
    materialCost: product?.materialCost?.toString() ?? "",
    packagingCost: product?.packagingCost?.toString() ?? "",
    measurementFields: (product?.measurementFields ?? [])
      .map((m) => [m.label, m.unit ?? "", m.guide ?? ""].join(" | "))
      .join("\n"),
    allowCustomColor: product?.allowCustomColor ?? false,
    inStock: product?.inStock ?? true,
    featured: product?.featured ?? false,
    active: product?.active ?? true,
  });
  const [images, setImages] = useState<string[]>(product?.images ?? []);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [savingAs, setSavingAs] = useState<SaveStatus | null>(null);
  const [deleting, setDeleting] = useState(false);
  const isDraft = product?.status === "draft";

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

  async function submit(status: SaveStatus) {
    setError(null);
    setSaving(true);
    setSavingAs(status);

    const payload = {
      status,
      name: form.name.trim(),
      slug: form.slug.trim() || undefined,
      subtitle: form.subtitle.trim() || undefined,
      category: form.category,
      madefor: form.madefor,
      infos: form.infos
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean)
        .map((label) => ({ label })),
      price: Number(form.price),
      oldPrice: form.oldPrice ? Number(form.oldPrice) : undefined,
      description: form.description.trim(),
      longDescription: form.longDescription.trim() || undefined,
      images,
      sizes: [],
      measurementFields: form.measurementFields
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean)
        .map((line) => {
          const [label, unit, guide] = line
            .split("|")
            .map((x) => x.trim());
          return {
            label,
            unit: unit || undefined,
            guide: guide || undefined,
          };
        })
        .filter((m) => m.label),
      allowCustomColor: form.allowCustomColor,
      colors: form.colors.split(",").map((s) => s.trim()).filter(Boolean),
      stockCount: form.stockCount ? Number(form.stockCount) : undefined,
      materialCost: form.materialCost ? Number(form.materialCost) : undefined,
      packagingCost: form.packagingCost
        ? Number(form.packagingCost)
        : undefined,
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
        setSavingAs(null);
        return;
      }
      router.push("/admin/products");
      router.refresh();
    } catch {
      setError("Something went wrong.");
      setSaving(false);
      setSavingAs(null);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    submit(editing && !isDraft ? "published" : "published");
  }

  async function handleTrash() {
    if (!editing) return;
    if (!confirm("Move this product to trash? You can restore it later.")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/products/${product!.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "trash" }),
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
          <div>
            <label className={label}>Made for</label>
            <select value={form.madefor} onChange={set("madefor")} className={input}>
              <option value="women">Women</option>
              <option value="men">Men</option>
              <option value="unisex">Unisex</option>
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
          <div className="sm:col-span-2">
            <label className={label}>Feature list (one per line)</label>
            <textarea
              rows={3}
              value={form.infos}
              onChange={set("infos")}
              placeholder={"Safe Payment\nFree Shipping\nDelivery in 2–5 days"}
              className={input}
            />
            <p className="mt-1 text-xs text-stone-400">
              Shown as bullet highlights on the product page and the featured
              section.
            </p>
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
            <label className={label}>Colors (comma separated)</label>
            <input
              value={form.colors}
              onChange={set("colors")}
              placeholder="Cream, Mocha"
              className={input}
            />
          </div>
          <div>
            <label className={label}>Material cost (₦, per unit)</label>
            <input
              type="number"
              min="0"
              value={form.materialCost}
              onChange={set("materialCost")}
              placeholder="e.g. 9500"
              className={input}
            />
          </div>
          <div>
            <label className={label}>Packaging cost (₦, per unit)</label>
            <input
              type="number"
              min="0"
              value={form.packagingCost}
              onChange={set("packagingCost")}
              placeholder="e.g. 1000"
              className={input}
            />
          </div>
          <p className="text-xs text-stone-400 sm:col-span-2">
            Material + packaging cost feed Cost of Goods (COGS) in Finance, so
            profit is calculated correctly. Leave blank if unknown.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6">
        <h2 className="font-semibold text-stone-900">Custom orders</h2>
        <p className="mt-1 text-sm text-stone-500">
          Let customers give exact measurements or request a colour on the
          product page.
        </p>
        <div className="mt-4 space-y-4">
          <div>
            <label className={label}>
              Measurement fields (one per line)
            </label>
            <textarea
              rows={4}
              value={form.measurementFields}
              onChange={set("measurementFields")}
              placeholder={
                "Head circumference | cm | head\nBust | cm | bust\nWaist | cm | waist\nLength | cm | length"
              }
              className={input}
            />
            <p className="mt-1 text-xs text-stone-400">
              Format: <code>Label | unit | guide</code>. The guide picks an
              illustrated &ldquo;how to measure&rdquo; diagram. Available guides:
              head, diameter, bust, chest, waist, hips, length, shoulder,
              sleeve, width, height, strap, foot. Unit and guide are optional.
            </p>
          </div>
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={form.allowCustomColor}
              onChange={set("allowCustomColor")}
              className="mt-0.5 h-4 w-4 rounded border-stone-300"
            />
            <span className="text-sm">
              <span className="font-medium text-stone-800">
                Allow custom colour requests
              </span>
              <span className="text-stone-400">
                {" "}
                — customers can type a colour and attach a reference photo
              </span>
            </span>
          </label>
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

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => submit("published")}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-xl bg-stone-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:opacity-60"
        >
          {saving && savingAs === "published" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : null}
          {editing
            ? isDraft
              ? "Publish"
              : "Save changes"
            : "Publish product"}
        </button>

        <button
          type="button"
          onClick={() => submit("draft")}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-xl border border-stone-300 px-5 py-3 text-sm font-semibold text-stone-700 transition hover:bg-stone-100 disabled:opacity-60"
        >
          {saving && savingAs === "draft" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <FileText className="h-4 w-4" />
          )}
          Save as draft
        </button>

        {editing ? (
          <button
            type="button"
            onClick={handleTrash}
            disabled={deleting}
            className="ml-auto inline-flex items-center gap-2 rounded-xl border border-rose-200 px-5 py-3 text-sm font-semibold text-rose-600 transition hover:bg-rose-50 disabled:opacity-60"
          >
            {deleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            Move to trash
          </button>
        ) : null}
      </div>
    </form>
  );
}
