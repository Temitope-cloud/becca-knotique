import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(1, "Name is required.").max(140),
  slug: z.string().max(160).optional(),
  subtitle: z.string().max(200).optional(),
  category: z.string().max(60),
  madefor: z.enum(["women", "men", "unisex"]).default("women"),
  infos: z
    .array(z.object({ label: z.string().min(1).max(120) }))
    .default([]),
  price: z.number().min(0),
  oldPrice: z.number().min(0).optional(),
  sizePrices: z
    .array(z.object({ size: z.string().min(1), price: z.number().min(0) }))
    .default([]),
  description: z.string().max(2000).default(""),
  longDescription: z.string().max(6000).optional(),
  images: z.array(z.string().url()).default([]),
  sizes: z.array(z.string()).default([]),
  colors: z.array(z.string()).default([]),
  stockCount: z.number().min(0).optional(),
  inStock: z.boolean().default(true),
  featured: z.boolean().default(false),
  active: z.boolean().default(true),
  status: z.enum(["published", "draft"]).default("published"),
});

export type ProductPayload = z.infer<typeof productSchema>;
