import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { getPublishedPosts } from "@/lib/blog";
import { SITE_URL, SITE_NAME, breadcrumbSchema } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Journal",
  description:
    "Stories, styling ideas and care guides from Becca's Knotique — handmade crochet fashion from Nigeria.",
  alternates: { canonical: "/journal" },
  openGraph: {
    title: "The Becca's Knotique Journal",
    description:
      "Stories, styling ideas and care guides for handmade crochet.",
    url: "/journal",
    type: "website",
  },
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-NG", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function JournalPage() {
  const posts = await getPublishedPosts();

  const blogJsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "@id": `${SITE_URL}/journal#blog`,
    name: `The ${SITE_NAME} Journal`,
    url: `${SITE_URL}/journal`,
    publisher: { "@id": `${SITE_URL}/#organization` },
    blogPost: posts.slice(0, 20).map((p) => ({
      "@type": "BlogPosting",
      headline: p.title,
      url: `${SITE_URL}/journal/${p.slug}`,
      datePublished: p.publishedAt ?? p.createdAt,
      image: p.coverImage || undefined,
    })),
  };

  const breadcrumbJsonLd = breadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "Journal", path: "/journal" },
  ]);

  return (
    <main className="min-h-screen w-full bg-white pb-20">
      <JsonLd data={blogJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />
      <section className="mx-auto w-full max-w-5xl px-4 pt-14 text-center sm:px-6 sm:pt-20">
        <p className="text-xs font-semibold tracking-[0.28em] text-emerald-700 uppercase">
          The Journal
        </p>
        <h1 className="font-apparel mt-3 text-4xl tracking-tight text-stone-900 sm:text-5xl">
          Stories, styling & care
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-stone-600 sm:text-base">
          Notes from the studio. How we make our pieces, how to wear them, and
          how to keep them looking beautiful.
        </p>
      </section>

      <section className="mx-auto mt-12 w-full max-w-5xl px-4 sm:px-6">
        {posts.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-stone-300 bg-stone-50 px-6 py-20 text-center">
            <p className="text-lg font-semibold text-stone-900">
              No posts yet
            </p>
            <p className="mt-1 text-sm text-stone-500">
              Check back soon. The first story is on its way.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((p) => (
              <Link key={p.id} href={`/journal/${p.slug}`} className="group">
                <article className="flex h-full flex-col">
                  <div className="relative aspect-[3/2] w-full overflow-hidden rounded-2xl bg-stone-100">
                    {p.coverImage ? (
                      <Image
                        src={p.coverImage}
                        alt={p.title}
                        fill
                        sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 33vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                    ) : null}
                  </div>
                  <p className="mt-3 text-xs text-stone-400">
                    {formatDate(p.publishedAt ?? p.createdAt)}
                  </p>
                  <h2 className="mt-1 text-lg font-semibold tracking-tight text-stone-900 group-hover:underline">
                    {p.title}
                  </h2>
                  {p.excerpt ? (
                    <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-stone-600">
                      {p.excerpt}
                    </p>
                  ) : null}
                </article>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
