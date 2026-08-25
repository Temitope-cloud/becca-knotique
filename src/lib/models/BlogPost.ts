import { Schema, model, models, type Model } from "mongoose";

export interface IBlogPost {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  /** sanitized HTML from the rich text editor */
  content: string;
  coverImage?: string;
  tags: string[];
  status: "published" | "draft";
  trashed: boolean;
  trashedAt?: Date | null;
  seoTitle?: string;
  seoDescription?: string;
  author?: string;
  publishedAt?: Date | null;
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const BlogPostSchema = new Schema<IBlogPost>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true, trim: true },
    excerpt: { type: String, default: "" },
    content: { type: String, default: "" },
    coverImage: { type: String },
    tags: { type: [String], default: [] },
    status: {
      type: String,
      enum: ["published", "draft"],
      default: "draft",
      index: true,
    },
    trashed: { type: Boolean, default: false, index: true },
    trashedAt: { type: Date, default: null },
    seoTitle: { type: String },
    seoDescription: { type: String },
    author: { type: String },
    publishedAt: { type: Date, default: null },
    viewCount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export const BlogPost: Model<IBlogPost> =
  (models.BlogPost as Model<IBlogPost>) ||
  model<IBlogPost>("BlogPost", BlogPostSchema);
