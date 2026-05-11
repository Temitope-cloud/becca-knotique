import { Lock, Package, Truck, type LucideIcon } from "lucide-react";

export type Product = {
  id: string;
  name: string;
  slug: string;
  subtitle?: string;

  category: "one-piece" | "new-collection" | "accessories" | "bags" | "";
  madefor: "women" | "men" | "unisex";

  price: number;
  oldPrice?: number;

  currency: "NGN";

  description: string;
  longDescription?: string;

  image?: string; //for new collections
  images?: string[];
  hoverImage?: string;

  rating?: number;

  sizes?: string[];
  colors?: string[];

  stars?: number;

  inStock?: boolean;
  stockCount?: number;

  tags?: string[];

  infos?: {
    label: string;
    icon?: LucideIcon;
  }[];

  createdAt?: string;
};

export const products: Product[] = [
  // One Piece
  {
    id: "golden-hour",
    name: "Golden Hour Dress",
    category: "one-piece",
    madefor: "women",
    stars: 5,
    price: 35000,
    oldPrice: 50000,
    slug: "golden-hour",
    currency: "NGN",
    infos: [
      {
        label: "Safe Payment",
        icon: Lock,
      },
      {
        label: "Free Shipping",
        icon: Truck,
      },
      {
        label: "Delivery in 2-5 days",
        icon: Package,
      },
    ],
    images: [
      "/images/products/one-piece/one-piece-1.jpeg",
      "/images/products/one-piece/one-piece-2.jpeg",
      "/images/products/one-piece/one-piece-3.jpeg",
      "/images/products/one-piece/one-piece-4.jpeg",
    ],
    description:
      "This Floral Fantasy dress features a flowy, lightweight polyester blend that’s wrinkle-resistant and perfect for adding a vibrant touch to any occasion.",
    rating: 5,
    tags: ["new", "featured"],
  },
  // New Collection
  {
    id: "granny-squares-top-skirt",
    name: "Granny Squares Top & Skirt",
    slug: "granny-squares-top-skirt",

    subtitle: "Statement Two-Piece Set",
    category: "new-collection",
    madefor: "women",

    price: 125000,
    oldPrice: 140000,
    currency: "NGN",
    stars: 5,
    rating: 4.9,
    sizes: ["S", "M", "L"],
    colors: ["Sunset Mix", "Earth Tones"],

    description:
      "A handcrafted two-piece crochet set with bold granny-square detailing, tailored for elegant statement styling.",

    longDescription:
      "This coordinated top-and-skirt set is handmade with premium yarn using classic granny-square techniques. It delivers a flattering silhouette, breathable comfort, and a confident fashion-forward look for events, photoshoots, and standout everyday wear.",

    images: [
      "/images/products/new-collection/new1.jpg",
      "/images/products/new-collection/new1-hover.jpg",
    ],

    hoverImage: "/images/products/new-collection/new1-hover.jpg",

    inStock: true,
    stockCount: 4,
    tags: ["new", "featured"],
    infos: [
      { label: "Safe Payment", icon: Lock },
      { label: "Free Shipping", icon: Truck },
      { label: "Delivery in 2-5 days", icon: Package },
    ],
    createdAt: "2026-02-01",
  },
  {
    id: "granny-square-vest",
    name: "Granny Square Vest",
    slug: "granny-square-vest",

    subtitle: "Layering Essential",
    category: "new-collection",
    madefor: "women",

    price: 60000,
    oldPrice: 75000,
    currency: "NGN",
    stars: 5,
    rating: 4.8,
    sizes: ["M", "L", "XL"],
    colors: ["Cream Multi", "Mocha Mix"],

    description:
      "A soft handmade crochet vest featuring colorful granny-square blocks for a modern vintage finish.",

    longDescription:
      "Designed as a versatile layering piece, this vest combines retro crochet craftsmanship with contemporary styling. Its breathable weave and durable yarn make it perfect over shirts, dresses, or tees for effortless day-to-night looks.",

    images: [
      "/images/products/new-collection/new2.jpg",
      "/images/products/new-collection/new2-hover.jpg",
    ],

    hoverImage: "/images/products/new-collection/new2-hover.jpg",

    inStock: true,
    stockCount: 6,
    tags: ["new", "trending"],
    infos: [
      { label: "Safe Payment", icon: Lock },
      { label: "Free Shipping", icon: Truck },
      { label: "Delivery in 2-5 days", icon: Package },
    ],
    createdAt: "2026-02-05",
  },
  {
    id: "granny-squares-set",
    name: "Granny Squares Set",
    slug: "granny-squares-set",

    subtitle: "Signature Accessories",
    category: "new-collection",
    madefor: "women",

    price: 90000,
    oldPrice: 100000,
    currency: "NGN",
    stars: 5,
    rating: 4.9,
    colors: ["Sunburst Mix", "Forest Mix"],

    description:
      "A handcrafted crochet bag set with vibrant granny-square panels, built for everyday elegance and utility.",

    longDescription:
      "Made for both style and practicality, this bag set pairs traditional crochet artistry with modern structure. Each piece is carefully handmade with durable yarn to hold essentials while elevating casual and occasion outfits.",

    images: [
      "/images/products/new-collection/new3.jpg",
      "/images/products/new-collection/new3-hover.jpg",
    ],

    hoverImage: "/images/products/new-collection/new3-hover.jpg",

    inStock: true,
    stockCount: 3,
    tags: ["new", "bestseller"],
    infos: [
      { label: "Safe Payment", icon: Lock },
      { label: "Free Shipping", icon: Truck },
      { label: "Delivery in 2-5 days", icon: Package },
    ],
    createdAt: "2026-02-10",
  },
  {
    id: "camel-crochet-three-piece-set",
    name: "Camel Crochet Three-Piece Set",
    slug: "camel-crochet-three-piece-set",

    subtitle: "Blazer, Bandeau & Pleated Skirt",
    category: "new-collection",
    madefor: "women",

    price: 125000,
    oldPrice: 142000,
    currency: "NGN",
    stars: 5,
    rating: 4.9,
    sizes: ["S", "M", "L"],
    colors: ["Camel & Ivory"],

    description:
      "A refined handmade crochet three-piece set pairing a textured cropped blazer, soft ivory bandeau, and pleated mini skirt in warm camel neutrals.",

    longDescription:
      "Designed as a coordinated editorial look, this set combines structured lapels and long sleeves with a crisp ivory crochet bandeau and a high-waisted pleated mini skirt. Each piece is crafted with dense artisan stitches that read beautifully on camera and in daylight—ideal for events, shoots, and confident everyday statement styling.",

    images: [
      "/images/products/camel-crochet-three-piece-set/camel-crochet-three-piece-set-1.jpeg",
      "/images/products/camel-crochet-three-piece-set/camel-crochet-three-piece-set-2.jpeg",
      "/images/products/camel-crochet-three-piece-set/camel-crochet-three-piece-set-3.jpeg",
    ],

    hoverImage:
      "/images/products/camel-crochet-three-piece-set/camel-crochet-three-piece-set-2.jpeg",

    inStock: true,
    stockCount: 4,
    tags: ["new", "featured"],
    infos: [
      { label: "Safe Payment", icon: Lock },
      { label: "Free Shipping", icon: Truck },
      { label: "Delivery in 2-5 days", icon: Package },
    ],
    createdAt: "2026-05-11",
  },
  {
    id: "sunset-stripe-bell-sleeve-crochet-mini-dress",
    name: "Sunset Stripe Bell-Sleeve Crochet Mini Dress",
    slug: "sunset-stripe-bell-sleeve-crochet-mini-dress",

    subtitle: "Granny Stitch & Earth-Tone Stripes",
    category: "new-collection",
    madefor: "women",

    price: 78000,
    oldPrice: 92000,
    currency: "NGN",
    stars: 5,
    rating: 4.9,
    sizes: ["S", "M", "L", "XL"],
    colors: ["Chocolate, Rust & Sunset Orange"],

    description:
      "A handmade crochet mini dress with horizontal earth-tone stripes, airy granny-stitch texture, and dramatic bell sleeves for elevated boho styling.",

    longDescription:
      "Designed around artisan texture and movement, this dress combines classic cluster stitches with bold flare sleeves and a clean boat neckline. The warm stripe rhythm reads beautifully outdoors and indoors alike—perfect for events, creative shoots, and statement casual dressing with breathable handmade comfort.",

    images: [
      "/images/products/sunset-stripe-bell-sleeve-crochet-mini-dress/sunset-stripe-bell-sleeve-crochet-mini-dress-4.png",
      "/images/products/sunset-stripe-bell-sleeve-crochet-mini-dress/sunset-stripe-bell-sleeve-crochet-mini-dress-3.png",
      "/images/products/sunset-stripe-bell-sleeve-crochet-mini-dress/sunset-stripe-bell-sleeve-crochet-mini-dress-2.png",
      "/images/products/sunset-stripe-bell-sleeve-crochet-mini-dress/sunset-stripe-bell-sleeve-crochet-mini-dress-1.png",
    ],

    hoverImage:
      "/images/products/sunset-stripe-bell-sleeve-crochet-mini-dress/sunset-stripe-bell-sleeve-crochet-mini-dress-3.png",

    inStock: true,
    stockCount: 5,
    tags: ["new", "featured"],
    infos: [
      { label: "Safe Payment", icon: Lock },
      { label: "Free Shipping", icon: Truck },
      { label: "Delivery in 2-5 days", icon: Package },
    ],
    createdAt: "2026-05-11",
  },

  // All products
  {
    id: "beanie",
    name: "Classic Ribbed  Beanie",
    slug: "beanie",

    category: "",
    madefor: "men",

    price: 15000,
    oldPrice: 20000,
    currency: "NGN",

    description:
      "A cozy handcrafted crochet beanie designed for everyday warmth with a clean, stylish finish.",

    longDescription:
      "This crochet beanie is handmade with premium, breathable yarn for all-day comfort and reliable warmth. Its soft texture, flexible fit, and timeless silhouette make it an easy choice for casual outfits, travel days, and cooler evenings.",

    images: [
      "/images/products/beanie/beanie-1.jpeg",
      "/images/products/beanie/beanie-2.jpeg",
      "/images/products/beanie/beanie-3.jpeg",
    ],

    hoverImage: "/images/products/beanie/beanie-2.jpeg",

    inStock: true,
    stockCount: 5,

    tags: ["featured", "new"],

    infos: [
      { label: "Safe Payment" },
      { label: "Free Shipping" },
      { label: "Delivery in 2–5 days" },
    ],

    createdAt: "2026-01-01",
  },
  {
    id: "lingerie",
    name: "Handmade Crochet Bikini Set",
    slug: "handmade-crochet-bikini-set",

    category: "",
    madefor: "women",

    price: 45000,
    oldPrice: 60000,
    currency: "NGN",

    description:
      "A stylish handmade crochet bikini set designed for confident, breathable comfort and standout beachwear looks.",

    longDescription:
      "This handcrafted crochet bikini set is made with high-quality yarn, offering a soft feel and secure fit. Designed for both comfort and style, it’s perfect for beach outings, vacations, and fashion-forward summer moments. Its breathable weave and flattering cut make it a must-have statement piece.",

    images: [
      "/images/products/lingerie/crochet-bikini-set-2.jpeg",
      "/images/products/lingerie/crochet-bikini-set-3.jpeg",
      "/images/products/lingerie/crochet-bikini-set-1.jpeg",
    ],

    hoverImage: "/images/products/lingerie/crochet-bikini-set-1.jpeg",

    inStock: true,
    stockCount: 5,

    tags: ["featured", "new"],

    infos: [
      { label: "Safe Payment" },
      { label: "Free Shipping" },
      { label: "Delivery in 2–5 days" },
    ],

    createdAt: "2026-01-01",
  },
  {
    id: "luxe-crochet-ruffle-mini-dress",
    name: "Luxe Crochet Ruffle Mini Dress",
    slug: "luxe-crochet-ruffle-mini-dress",

    category: "",
    madefor: "women",

    price: 65000,
    oldPrice: 80000,
    currency: "NGN",

    description:
      "A bold handcrafted crochet mini dress featuring layered ruffles and a sculpted silhouette for standout styling.",

    longDescription:
      "This luxe crochet ruffle mini dress is carefully handmade to deliver a striking, feminine silhouette. With detailed stitching, breathable fabric, and layered ruffle accents, it’s designed for special occasions, photoshoots, and confident everyday fashion. It combines elegance with playful texture for a truly eye-catching look.",

    images: [
      "/images/products/cool/luxe-crochet-ruffle-mini-dress-1.jpeg",
      "/images/products/cool/luxe-crochet-ruffle-mini-dress-2.jpeg",
      "/images/products/cool/luxe-crochet-ruffle-mini-dress-3.jpeg",
    ],

    hoverImage: "/images/products/cool/luxe-crochet-ruffle-mini-dress-2.jpeg",

    inStock: true,
    stockCount: 5,

    tags: ["featured", "new"],

    infos: [
      { label: "Safe Payment" },
      { label: "Free Shipping" },
      { label: "Delivery in 2–5 days" },
    ],

    createdAt: "2026-01-01",
  },
];

export const getProductsByCategory = (category: string) =>
  products.filter((p) => p.category === category);
