import type { MetadataRoute } from "next";
import { products } from "@/data/Products";

const baseUrl = "https://www.beccasknotique.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const validProducts = products.filter((p) => p.slug && p.name);
  const productEntries: MetadataRoute.Sitemap = validProducts.map(
    (product) => ({
      url: `${baseUrl}/products/${product.slug}`,
      lastModified: product.createdAt
        ? new Date(product.createdAt)
        : new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.85,
    }),
  );

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
    ...productEntries,
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
