import { Schema, model, models, type Model } from "mongoose";

export interface IProductInfo {
  label: string;
}

export interface IProduct {
  _id: string;
  name: string;
  slug: string;
  subtitle?: string;
  category: string;
  madefor?: "women" | "men" | "unisex";
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
  infos: IProductInfo[];
  featured: boolean;
  active: boolean;
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true, trim: true },
    subtitle: { type: String },
    category: { type: String, default: "", index: true },
    madefor: { type: String, enum: ["women", "men", "unisex"], default: "women" },
    price: { type: Number, required: true, min: 0 },
    oldPrice: { type: Number, min: 0 },
    currency: { type: String, default: "NGN" },
    description: { type: String, default: "" },
    longDescription: { type: String },
    image: { type: String },
    images: { type: [String], default: [] },
    hoverImage: { type: String },
    sizes: { type: [String], default: [] },
    colors: { type: [String], default: [] },
    stars: { type: Number, min: 0, max: 5 },
    rating: { type: Number, min: 0, max: 5 },
    inStock: { type: Boolean, default: true },
    stockCount: { type: Number, min: 0 },
    tags: { type: [String], default: [] },
    infos: {
      type: [new Schema<IProductInfo>({ label: String }, { _id: false })],
      default: [],
    },
    featured: { type: Boolean, default: false, index: true },
    active: { type: Boolean, default: true, index: true },
    viewCount: { type: Number, default: 0, index: true },
  },
  { timestamps: true },
);

export const Product: Model<IProduct> =
  (models.Product as Model<IProduct>) || model<IProduct>("Product", ProductSchema);
