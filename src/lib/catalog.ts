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
  tags: string[];
  infos: { label: string }[];
  featured: boolean;
  active: boolean;
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
    tags: doc.tags ?? [],
    infos: (doc.infos ?? []).map((i) => ({ label: i.label })),
    featured: !!doc.featured,
    active: doc.active !== false,
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
    tags: p.tags ?? [],
    infos: (p.infos ?? []).map((i) => ({ label: i.label })),
    featured: false,
    active: true,
  };
}

async function dbIsEmpty(): Promise<boolean> {
  await connectToDatabase();
  return (await Product.estimatedDocumentCount()) === 0;
}

const staticValid = () =>
  staticProducts.filter((p) => p.slug && p.name).map(fromStatic);

/** All products. Storefront gets active-only by default; admin passes includeInactive. */
export async function getAllProducts(opts?: {
  includeInactive?: boolean;
}): Promise<CatalogProduct[]> {
  if (await dbIsEmpty()) return staticValid();
  const filter = opts?.includeInactive ? {} : { active: { $ne: false } };
  const docs = await Product.find(filter).sort({ createdAt: -1 }).lean<IProduct[]>();
  return docs.map(fromDoc);
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

export async function getFeaturedProduct(): Promise<CatalogProduct | null> {
  const all = await getAllProducts();
  return all.find((p) => p.featured) ?? all.find((p) => p.category === "one-piece") ?? all[0] ?? null;
}
