import { Schema, model, models, type Model } from "mongoose";

export interface IProductInfo {
  label: string;
}

/**
 * A measurement the customer can supply for a made-to-measure order. Defined
 * per product so a dress can ask for bust/waist/hips while a cap asks only for
 * head circumference. `guide` names the illustrated "how to measure" diagram.
 */
export interface IMeasurementField {
  label: string;
  /** Unit shown next to the input, e.g. "cm" or "in". Defaults to "cm". */
  unit?: string;
  /** Key of the diagram to show ("head", "bust", "waist", …). Optional. */
  guide?: string;
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
  /** Optional absolute price override per size (e.g. XL costs more). */
  sizePrices: { size: string; price: number }[];
  currency: "NGN";
  /** Measurement fields offered for made-to-measure orders (per product). */
  measurementFields: IMeasurementField[];
  /** Let customers request a custom colour and attach a reference image. */
  allowCustomColor: boolean;
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
  /** true = crocheted after the customer orders (no fixed stock). */
  madeToOrder: boolean;
  /** how long a made-to-order (or ready-made) item takes, e.g. "2 to 3 weeks". */
  leadTime?: string;
  tags: string[];
  infos: IProductInfo[];
  featured: boolean;
  active: boolean;
  /** COGS inputs (NGN) — direct material and packaging cost per unit. */
  materialCost?: number;
  packagingCost?: number;
  /** Optional per-size material cost override (bigger sizes use more yarn). */
  sizeMaterialCosts: { size: string; cost: number }[];
  /** "published" shows on the storefront; "draft" is saved but hidden. */
  status: "published" | "draft";
  /** soft delete */
  trashed: boolean;
  trashedAt?: Date | null;
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
    sizePrices: {
      type: [
        new Schema<{ size: string; price: number }>(
          { size: String, price: Number },
          { _id: false },
        ),
      ],
      default: [],
    },
    currency: { type: String, default: "NGN" },
    measurementFields: {
      type: [
        new Schema<IMeasurementField>(
          { label: String, unit: String, guide: String },
          { _id: false },
        ),
      ],
      default: [],
    },
    allowCustomColor: { type: Boolean, default: false },
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
    madeToOrder: { type: Boolean, default: false },
    leadTime: { type: String },
    tags: { type: [String], default: [] },
    infos: {
      type: [new Schema<IProductInfo>({ label: String }, { _id: false })],
      default: [],
    },
    featured: { type: Boolean, default: false, index: true },
    active: { type: Boolean, default: true, index: true },
    materialCost: { type: Number, min: 0, default: 0 },
    packagingCost: { type: Number, min: 0, default: 0 },
    sizeMaterialCosts: {
      type: [
        new Schema<{ size: string; cost: number }>(
          { size: String, cost: Number },
          { _id: false },
        ),
      ],
      default: [],
    },
    status: {
      type: String,
      enum: ["published", "draft"],
      default: "published",
      index: true,
    },
    trashed: { type: Boolean, default: false, index: true },
    trashedAt: { type: Date, default: null },
    viewCount: { type: Number, default: 0, index: true },
  },
  { timestamps: true },
);

export const Product: Model<IProduct> =
  (models.Product as Model<IProduct>) || model<IProduct>("Product", ProductSchema);
