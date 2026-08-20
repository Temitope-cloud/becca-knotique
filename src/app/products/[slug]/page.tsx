import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft, ShieldCheck, Sparkles, Truck } from "lucide-react";
import {
  getAllProducts,
  getProductBySlug,
  type CatalogProduct,
} from "@/lib/catalog";
import GalleryChartLink from "@/components/GalleryChartLink";
import ProductGallery from "@/components/ProductGallery";
import ProductRevisitNudge from "@/components/ProductRevisitNudge";
import ProductViewTracker from "@/components/ProductViewTracker";
import ProductPurchasePanel from "@/components/cart/ProductPurchasePanel";
// v1 ordered via WhatsApp — kept in src/lib/utils.ts (getWhatsAppLink) as a fallback.

type ProductDetailsProps = {
  params: Promise<{ slug: string }>;
};

const SITE_URL = "https://www.beccasknotique.com";

const formatPrice = (value: number) => `₦${value.toLocaleString()}`;

function truncateMeta(text: string, max = 158): string {
  const trimmed = text.trim().replace(/\s+/g, " ");
  if (trimmed.length <= max) return trimmed;
  const cut = trimmed.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  const base =
    lastSpace > 72 ? cut.slice(0, lastSpace) : cut.slice(0, max - 1);
  return `${base.trimEnd()}…`;
}

function galleryImages(product: CatalogProduct): string[] {
  if (product.images?.length) return product.images;
  if (product.image) return [product.image];
  return [];
}

function absoluteUrl(path: string): string {
  if (path.startsWith("http")) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export async function generateMetadata({
  params,
}: ProductDetailsProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product not found" };

  const plainDescription =
    product.longDescription ?? product.description ?? product.name;
  const metaDescription = truncateMeta(plainDescription);
  const canonicalPath = `/products/${product.slug}`;
  const imgs = galleryImages(product);
  const ogImages =
    imgs.length > 0
      ? imgs.map((src, i) => ({
          url: src,
          alt: `${product.name}${i > 0 ? ` — photo ${i + 1}` : ""}`,
          width: 1200,
          height: 1200,
        }))
      : [{ url: "/images/about1.png", width: 1200, height: 630, alt: product.name }];

  const keywordParts = [
    product.category?.replace("-", " "),
    "handmade crochet",
    "Becca's Knotique",
    ...(product.tags ?? []),
  ].filter(Boolean) as string[];

  return {
    title: product.name,
    description: metaDescription,
    keywords: Array.from(new Set(keywordParts.map((k) => k.toLowerCase()))),
    openGraph: {
      title: product.name,
      description: metaDescription,
      url: canonicalPath,
      type: "website",
      images: ogImages,
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description: metaDescription,
      images: ogImages.map((img) => img.url),
    },
    alternates: {
      canonical: canonicalPath,
    },
  };
}

export default async function ProductDetails({ params }: ProductDetailsProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const validProducts = await getAllProducts();

  const gallery = galleryImages(product);
  const discount =
    typeof product.oldPrice === "number" && product.oldPrice > product.price
      ? Math.round(
          ((product.oldPrice - product.price) / product.oldPrice) * 100,
        )
      : null;

  const relatedProducts = validProducts
    .filter(
      (item) =>
        item.slug !== product.slug && item.category === product.category,
    )
    .slice(0, 3);

  const inStock = product.inStock !== false;

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${SITE_URL}/products/${product.slug}#product`,
    url: `${SITE_URL}/products/${product.slug}`,
    name: product.name,
    description: truncateMeta(product.longDescription ?? product.description, 480),
    image: gallery.length
      ? gallery.map(absoluteUrl)
      : [absoluteUrl("/images/about1.png")],
    category: product.category?.replace("-", " "),
    brand: {
      "@type": "Brand",
      name: "Becca's Knotique",
    },
    offers: {
      "@type": "Offer",
      url: `${SITE_URL}/products/${product.slug}`,
      priceCurrency: product.currency ?? "NGN",
      price: product.price.toString(),
      availability: inStock
        ? ("https://schema.org/InStock" as const)
        : ("https://schema.org/OutOfStock" as const),
      itemCondition: "https://schema.org/NewCondition",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <ProductViewTracker slug={product.slug} />
      <main className="relative min-h-screen w-full bg-stone-50 pb-16">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-linear-to-b from-amber-100/55 via-rose-50/35 to-transparent"
        aria-hidden
      />

      <section className="relative mx-auto w-full max-w-7xl px-4 pt-12 sm:px-6 md:pt-16">
        <Link
          href="/products"
          className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-4 py-2 text-xs font-semibold tracking-[0.12em] text-stone-700 uppercase transition hover:border-stone-300"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to products
        </Link>

        <div className="mt-6 grid grid-cols-1 gap-7 rounded-3xl border border-stone-200/80 bg-white/90 p-4 shadow-[0_25px_80px_-42px_rgba(0,0,0,0.45)] backdrop-blur-sm sm:p-6 lg:grid-cols-2 lg:gap-10 lg:p-8">
          <div className="flex min-w-0 flex-col lg:sticky lg:top-24 lg:self-start">
            <ProductGallery images={gallery} name={product.name} />
            <GalleryChartLink />
          </div>

          <div className="flex flex-col">
            <p className="inline-flex w-fit items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-[11px] font-semibold tracking-[0.16em] text-rose-700 uppercase">
              <Sparkles className="h-3.5 w-3.5" />
              Handmade premium
            </p>

            <h1 className="mt-4 text-4xl leading-tight font-semibold tracking-tight text-stone-900 sm:text-5xl">
              {product.name}
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-stone-600 sm:text-base">
              {product.longDescription || product.description}
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <p className="text-4xl font-semibold tracking-tight text-stone-900">
                {formatPrice(product.price)}
              </p>
              {product.oldPrice ? (
                <p className="text-xl text-stone-400 line-through">
                  {formatPrice(product.oldPrice)}
                </p>
              ) : null}
              {discount ? (
                <span className="rounded-full bg-emerald-700/10 px-3 py-1 text-xs font-semibold tracking-wide text-emerald-900 uppercase">
                  Save {discount}%
                </span>
              ) : null}
            </div>

            <div className="mt-5 grid grid-cols-1 gap-3 rounded-2xl border border-stone-200/80 bg-stone-50/70 p-4 sm:grid-cols-3">
              <div className="flex items-center gap-2 text-sm font-medium text-stone-700">
                <Truck className="h-4 w-4 text-stone-900" />
                Fast shipping
              </div>
              <div className="flex items-center gap-2 text-sm font-medium text-stone-700">
                <ShieldCheck className="h-4 w-4 text-stone-900" />
                Secure payment
              </div>
              <div className="flex items-center gap-2 text-sm font-medium text-stone-700">
                <Sparkles className="h-4 w-4 text-stone-900" />
                Premium finish
              </div>
            </div>

            <ProductRevisitNudge slug={product.slug} />

            <ProductPurchasePanel
              product={{
                id: product.id,
                slug: product.slug,
                name: product.name,
                price: product.price,
                image: product.images?.[0] ?? product.image,
                sizes: product.sizes,
                colors: product.colors,
                inStock: product.inStock,
              }}
            />

            {/* v1 fallback — order on WhatsApp (disabled while Paystack checkout is live):
            <a
              href={getWhatsAppLink(product)}
              target="_blank"
              className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-6 py-4 text-sm font-semibold tracking-[0.14em] text-white uppercase transition hover:bg-green-700"
            >
              Order on WhatsApp
              <ArrowRight className="h-4 w-4" />
            </a>
            */}

            {product.infos?.length ? (
              <div className="mt-6 space-y-2 rounded-2xl border border-stone-200 bg-white p-4">
                {product.infos.map((info, index) => (
                  <p
                    key={`${info.label}-${index}`}
                    className="text-sm text-stone-600"
                  >
                    - {info.label}
                  </p>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </section>

      {relatedProducts.length ? (
        <section className="mx-auto mt-14 w-full max-w-7xl px-4 sm:px-6">
          <div className="mb-5 flex items-end justify-between">
            <h2 className="text-2xl font-semibold tracking-tight text-stone-900 sm:text-3xl">
              You may also like
            </h2>
            <Link
              href="/products"
              className="text-sm font-medium text-stone-600 underline-offset-4 transition hover:text-stone-900 hover:underline"
            >
              View all
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {relatedProducts.map((item) => {
              const image = item.images?.[0] ?? item.image ?? "";
              const hoverImage = item.hoverImage ?? item.images?.[1];
              return (
                <Link
                  key={item.slug}
                  href={`/products/${item.slug}`}
                  className="group overflow-hidden rounded-2xl border border-stone-200/80 bg-white p-3 shadow-[0_18px_55px_-35px_rgba(0,0,0,0.35)] transition hover:-translate-y-0.5 hover:shadow-[0_24px_60px_-30px_rgba(0,0,0,0.35)]"
                >
                  <div className="relative aspect-3/4 w-full overflow-hidden rounded-xl bg-stone-100">
                    {image ? (
                      <>
                        <Image
                          src={image}
                          alt={item.name}
                          fill
                          sizes="(max-width: 1024px) 50vw, 33vw"
                          className="object-cover object-center transition-transform duration-500 group-hover:scale-[1.03]"
                        />
                        {hoverImage ? (
                          <Image
                            src={hoverImage}
                            alt=""
                            aria-hidden
                            fill
                            sizes="(max-width: 1024px) 50vw, 33vw"
                            className="object-cover object-center opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                          />
                        ) : null}
                      </>
                    ) : null}
                  </div>
                  <div className="mt-3">
                    <p className="text-xl font-semibold tracking-tight text-stone-900">
                      {item.name}
                    </p>
                    <p className="mt-1 text-sm text-stone-600">
                      {formatPrice(item.price)}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      ) : null}
    </main>
    </>
  );
}
