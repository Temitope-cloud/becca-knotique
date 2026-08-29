import type { MetadataRoute } from "next";
import { getAllProducts } from "@/lib/catalog";
import { getPublishedPosts } from "@/lib/blog";
import { SITE_URL as baseUrl } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Product URLs need the DB. If it's unreachable at build time (e.g. env vars
  // not yet set), fall back to the static routes rather than failing the whole
  // deploy — a sitemap without every product beats no deploy at all.
  let productEntries: MetadataRoute.Sitemap = [];
  try {
    const products = await getAllProducts();
    productEntries = products.map((product) => ({
      url: `${baseUrl}/products/${product.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.85,
    }));
  } catch (error) {
    console.error("[sitemap] could not load products:", error);
  }

  let postEntries: MetadataRoute.Sitemap = [];
  try {
    const posts = await getPublishedPosts();
    postEntries = posts.map((post) => ({
      url: `${baseUrl}/journal/${post.slug}`,
      lastModified: new Date(post.updatedAt),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));
  } catch (error) {
    console.error("[sitemap] could not load posts:", error);
  }

  return [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/products`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.95,
    },
    {
      url: `${baseUrl}/products/chart`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.75,
    },
    {
      url: `${baseUrl}/trending`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    ...productEntries,
    {
      url: `${baseUrl}/journal`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...postEntries,
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/our-story`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/legal`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/legal/privacy-policy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.4,
    },
    {
      url: `${baseUrl}/legal/refund-policy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.4,
    },
    {
      url: `${baseUrl}/legal/terms-of-service`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.4,
    },
    {
      url: `${baseUrl}/legal/disclaimer`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.4,
    },
  ];
}
