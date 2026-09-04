import { z } from "zod";

export const releaseSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use a date like 2026-09-04."),
  title: z.string().min(1).max(160),
  tag: z.enum(["launch", "feature", "improvement", "fix"]),
  items: z.array(z.string().min(1).max(600)).min(1).max(30),
});

export type ReleasePayload = z.infer<typeof releaseSchema>;
