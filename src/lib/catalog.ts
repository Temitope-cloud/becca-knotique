import "server-only";
import { connectToDatabase } from "@/lib/db";
import { Product, type IProduct } from "@/lib/models/Product";
import { products as staticProducts } from "@/data/Products";

/** Plain, serializable product used everywhere in the UI. */
export interface CatalogProduct {
  id: string;
  name: string;
  slug: string;
  subtitle?: string;
  category: string;
  madefor?: string;
  price: number;
  oldPrice?: number;
  sizePrices: { size: string; price: number }[];
  sizeMaterialCosts: { size: string; cost: number }[];
  measurementFields: { label: string; unit?: string; guide?: string }[];
  allowCustomColor: boolean;
  currency: "NGN";
  description: string;
  longDescription?: string;
  image?: string;
  images: string[];
  hoverImage?: string;
  sizes: string[];
  colors: string[];
  stars?: number;
  rating?: number;
  inStock: boolean;
  stockCount?: number;
  madeToOrder: boolean;
  leadTime?: string;
  materialCost?: number;
  packagingCost?: number;
  tags: string[];
  infos: { label: string }[];
  featured: boolean;
  active: boolean;
  status: "published" | "draft";
  trashed: boolean;
  viewCount?: number;
}

function fromDoc(doc: IProduct): CatalogProduct {
  return {
    id: doc._id.toString(),
    name: doc.name,
    slug: doc.slug,
    subtitle: doc.subtitle,
    category: doc.category ?? "",
    madefor: doc.madefor,
    price: doc.price,
    oldPrice: doc.oldPrice,
    sizePrices: (doc.sizePrices ?? []).map((sp) => ({ size: sp.size, price: sp.price })),
    sizeMaterialCosts: (doc.sizeMaterialCosts ?? []).map((sc) => ({
      size: sc.size,
      cost: sc.cost,
    })),
    measurementFields: (doc.measurementFields ?? []).map((m) => ({
      label: m.label,
      unit: m.unit,
      guide: m.guide,
    })),
    allowCustomColor: !!doc.allowCustomColor,
    currency: "NGN",
    description: doc.description ?? "",
    longDescription: doc.longDescription,
    image: doc.image,
    images: doc.images ?? [],
    hoverImage: doc.hoverImage,
    sizes: doc.sizes ?? [],
    colors: doc.colors ?? [],
    stars: doc.stars,
    rating: doc.rating,
    inStock: doc.inStock !== false,
    stockCount: doc.stockCount,
    madeToOrder: !!doc.madeToOrder,
    leadTime: doc.leadTime,
    materialCost: doc.materialCost,
    packagingCost: doc.packagingCost,
    tags: doc.tags ?? [],
    infos: (doc.infos ?? []).map((i) => ({ label: i.label })),
    featured: !!doc.featured,
    active: doc.active !== false,
    status: doc.status === "draft" ? "draft" : "published",
    trashed: !!doc.trashed,
    viewCount: doc.viewCount ?? 0,
  };
}

/** Fallback mapping from the static seed file (used only before the DB is seeded). */
function fromStatic(p: (typeof staticProducts)[number]): CatalogProduct {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    subtitle: p.subtitle,
    category: p.category ?? "",
    madefor: p.madefor,
    price: p.price,
    oldPrice: p.oldPrice,
    sizePrices: [],
    sizeMaterialCosts: [],
    measurementFields: [],
    allowCustomColor: false,
    currency: "NGN",
    description: p.description ?? "",
    longDescription: p.longDescription,
    image: p.image,
    images: p.images ?? [],
    hoverImage: p.hoverImage,
    sizes: p.sizes ?? [],
    colors: p.colors ?? [],
    stars: p.stars,
    rating: p.rating,
    inStock: p.inStock !== false,
    stockCount: p.stockCount,
    madeToOrder: false,
    leadTime: undefined,
    tags: p.tags ?? [],
    infos: (p.infos ?? []).map((i) => ({ label: i.label })),
    featured: false,
    active: true,
    status: "published",
    trashed: false,
    viewCount: 0,
  };
}

async function dbIsEmpty(): Promise<boolean> {
  await connectToDatabase();
  return (await Product.estimatedDocumentCount()) === 0;
}

const staticValid = () =>
  staticProducts.filter((p) => p.slug && p.name).map(fromStatic);

/**
 * All products.
 * - Storefront (default): published, active, not trashed.
 * - Admin (includeInactive): everything except trash (published + drafts + hidden).
 * - trashedOnly: just the trash.
 */
export async function getAllProducts(opts?: {
  includeInactive?: boolean;
  trashedOnly?: boolean;
}): Promise<CatalogProduct[]> {
  if (await dbIsEmpty()) return opts?.trashedOnly ? [] : staticValid();
  const filter: Record<string, unknown> = opts?.trashedOnly
    ? { trashed: true }
    : opts?.includeInactive
      ? { trashed: { $ne: true } }
      : {
          trashed: { $ne: true },
          active: { $ne: false },
          status: { $ne: "draft" },
        };
  const docs = await Product.find(filter)
    .sort({ createdAt: -1 })
    .lean<IProduct[]>();
  return docs.map(fromDoc);
}

/**
 * Whether a product may be shown to shoppers: published, active, not trashed.
 * The listing queries already filter on this; use it to gate the single-product
 * detail page and checkout, which look products up directly by slug/id.
 */
export function isStorefrontVisible(p: CatalogProduct): boolean {
  return p.active !== false && p.status !== "draft" && !p.trashed;
}

export async function getProductBySlug(
  slug: string,
): Promise<CatalogProduct | null> {
  if (await dbIsEmpty()) {
    const p = staticValid().find((x) => x.slug === slug);
    return p ?? null;
  }
  const doc = await Product.findOne({ slug }).lean<IProduct>();
  return doc ? fromDoc(doc) : null;
}

export async function getProductById(
  id: string,
): Promise<CatalogProduct | null> {
  if (await dbIsEmpty()) {
    const p = staticValid().find((x) => x.id === id);
    return p ?? null;
  }
  const doc = await Product.findById(id).lean<IProduct>().catch(() => null);
  return doc ? fromDoc(doc) : null;
}

export async function getProductsByCategory(
  category: string,
): Promise<CatalogProduct[]> {
  const all = await getAllProducts();
  return all.filter((p) => p.category === category);
}

/**
 * Distinct categories already in use (across published, draft and hidden
 * products) — used to suggest existing categories in the admin product form
 * while still allowing a brand-new one to be typed.
 */
export async function getCategories(): Promise<string[]> {
  const all = await getAllProducts({ includeInactive: true });
  const set = new Set<string>();
  for (const p of all) if (p.category) set.add(p.category);
  return Array.from(set).sort();
}

/**
 * Featured products (published, in stock-status, not trashed), most recently
 * featured first. The homepage uses the first as the "Limited Edition" hero and
 * the rest for the "Just Dropped" grid.
 */
export async function getFeaturedProducts(
  limit = 12,
): Promise<CatalogProduct[]> {
  if (await dbIsEmpty()) return [];
  const docs = await Product.find({
    featured: true,
    active: { $ne: false },
    status: { $ne: "draft" },
    trashed: { $ne: true },
  })
    .sort({ updatedAt: -1 })
    .limit(limit)
    .lean<IProduct[]>();
  return docs.map(fromDoc);
}

export async function getFeaturedProduct(): Promise<CatalogProduct | null> {
  const featured = await getFeaturedProducts(1);
  if (featured[0]) return featured[0];
  // Fallback so the hero still shows something before anything is featured.
  const all = await getAllProducts();
  return all.find((p) => p.category === "one-piece") ?? all[0] ?? null;
}

/** Active products for the given slugs, in the order the slugs were given. */
export async function getProductsBySlugs(
  slugs: string[],
): Promise<CatalogProduct[]> {
  if (!slugs.length) return [];
  const all = await getAllProducts();
  const bySlug = new Map(all.map((p) => [p.slug, p]));
  return slugs.map((s) => bySlug.get(s)).filter(Boolean) as CatalogProduct[];
}

/** Most-viewed active products (global view counts). */
export async function getMostViewed(limit = 8): Promise<CatalogProduct[]> {
  if (await dbIsEmpty()) return staticValid().slice(0, limit);
  const docs = await Product.find({
    active: { $ne: false },
    status: { $ne: "draft" },
    trashed: { $ne: true },
  })
    .sort({ viewCount: -1, createdAt: -1 })
    .limit(limit)
    .lean<IProduct[]>();
  return docs.filter((d) => (d.viewCount ?? 0) > 0).map(fromDoc);
}

/** Best sellers computed from paid orders (by units sold). */
export async function getBestSellers(limit = 8): Promise<CatalogProduct[]> {
  await connectToDatabase();
  const { Order } = await import("@/lib/models/Order");
  const rows = await Order.aggregate<{ _id: string; qty: number }>([
    { $match: { status: "paid" } },
    { $unwind: "$items" },
    {
      $group: {
        _id: "$items.slug",
        qty: { $sum: "$items.quantity" },
      },
    },
    { $sort: { qty: -1 } },
    { $limit: limit },
  ]);
  const slugs = rows.map((r) => r._id).filter(Boolean);
  return getProductsBySlugs(slugs);
}
