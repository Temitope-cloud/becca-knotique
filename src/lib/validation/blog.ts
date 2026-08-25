import { z } from "zod";

export const blogPostSchema = z.object({
  title: z.string().min(1, "Title is required.").max(160),
  slug: z.string().max(180).optional(),
  excerpt: z.string().max(320).default(""),
  content: z.string().default(""),
  coverImage: z.string().url().optional().or(z.literal("")),
  tags: z.array(z.string()).default([]),
  status: z.enum(["published", "draft"]).default("draft"),
  seoTitle: z.string().max(160).optional(),
  seoDescription: z.string().max(320).optional(),
});

export type BlogPostPayload = z.infer<typeof blogPostSchema>;
