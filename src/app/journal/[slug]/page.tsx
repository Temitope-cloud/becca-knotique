import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getPublishedPostBySlug } from "@/lib/blog";
import { PROSE_CLASS } from "@/lib/prose";
import { SITE_URL, SITE_NAME, breadcrumbSchema } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";

export const dynamic = "force-dynamic";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-NG", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);
  if (!post) return { title: "Post not found" };

  const title = post.seoTitle || post.title;
  const description = post.seoDescription || post.excerpt || undefined;
  const url = `/journal/${post.slug}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "article",
      publishedTime: post.publishedAt ?? undefined,
      images: post.coverImage ? [{ url: post.coverImage }] : undefined,
    },
    twitter: {
      card: post.coverImage ? "summary_large_image" : "summary",
      title,
      description,
      images: post.coverImage ? [post.coverImage] : undefined,
    },
  };
}

export default async function JournalPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);
  if (!post) notFound();

  const dateIso = post.publishedAt ?? post.createdAt;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt || undefined,
    image: post.coverImage ? [post.coverImage] : undefined,
    datePublished: dateIso,
    dateModified: post.updatedAt,
    author: {
      "@type": "Organization",
      name: post.author || SITE_NAME,
    },
    publisher: { "@id": `${SITE_URL}/#organization` },
    mainEntityOfPage: `${SITE_URL}/journal/${post.slug}`,
  };

  const breadcrumbJsonLd = breadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "Journal", path: "/journal" },
    { name: post.title, path: `/journal/${post.slug}` },
  ]);

  return (
    <main className="min-h-screen w-full bg-white pb-24">
      <article className="mx-auto w-full max-w-3xl px-4 pt-10 sm:px-6 sm:pt-14">
        <Link
          href="/journal"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-stone-500 transition hover:text-stone-900"
        >
          <ArrowLeft className="h-4 w-4" /> All posts
        </Link>

        <header className="mt-6">
          <p className="text-xs text-stone-400">{formatDate(dateIso)}</p>
          <h1 className="font-apparel mt-2 text-3xl tracking-tight text-stone-900 sm:text-4xl">
            {post.title}
          </h1>
          {post.excerpt ? (
            <p className="mt-3 text-base leading-relaxed text-stone-600">
              {post.excerpt}
            </p>
          ) : null}
          {post.tags.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {post.tags.map((t) => (
                <span
                  key={t}
                  className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-600"
                >
                  {t}
                </span>
              ))}
            </div>
          ) : null}
        </header>

        {post.coverImage ? (
          <div className="relative mt-8 aspect-[16/9] w-full overflow-hidden rounded-3xl bg-stone-100">
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              sizes="(max-width:768px) 100vw, 768px"
              className="object-cover"
              priority
            />
          </div>
        ) : null}

        <div
          className={`mt-8 ${PROSE_CLASS}`}
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        <div className="mt-14 rounded-3xl border border-stone-200 bg-stone-50 px-6 py-8 text-center">
          <p className="text-lg font-semibold text-stone-900">
            Find your next favourite piece
          </p>
          <p className="mt-1 text-sm text-stone-600">
            Every item is handmade with care. Browse the shop and treat yourself.
          </p>
          <Link
            href="/products"
            className="mt-5 inline-flex rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            Shop the collection
          </Link>
        </div>
      </article>

      <JsonLd data={jsonLd} />
      <JsonLd data={breadcrumbJsonLd} />
    </main>
  );
}
