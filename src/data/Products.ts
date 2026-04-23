import React from "react";
import { Box, Lock, Truck } from "lucide-react";
export const newCollection = [
  {
    name: "Stylish Cro 1",
    subtitle: "Fashion",
    src: "/images/new-collection/new1.jpg",
    hoverSrc: "/images/new-collection/new1-hover.jpg",
    newPrice: "$100",
    oldPrice: "$128",
  },
  {
    name: "Stylish Cro 2",
    subtitle: "Fashion",
    src: "/images/new-collection/new2.jpg",
    hoverSrc: "/images/new-collection/new2-hover.jpg",
    newPrice: "$100",
    oldPrice: "$128",
  },
  {
    name: "Stylish Cro 3",
    subtitle: "Fashion",
    src: "/images/new-collection/new3.jpg",
    hoverSrc: "/images/new-collection/new3-hover.jpg",
    newPrice: "$100",
    oldPrice: "$128",
  },
  // add more products here
];

export const onePiece = [
  {
    name: "Golden Hour",
    currentPrice: "₦35,000",
    oldPrice: "₦50,000",
    stars: 5,
    description:
      "This Floral Fantasy dress features a flowy, lightweight polyester blend that’s wrinkle-resistant and perfect for adding a vibrant touch to any occasion.",
    btn: "Order Now",
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
        icon: Box,
      },
    ],
    imgs: [
      "/images/one-piece/one-piece-1.jpeg",
      "/images/one-piece/one-piece-2.jpeg",
      "/images/one-piece/one-piece-3.jpeg",
      "/images/one-piece/one-piece-4.jpeg",
    ],
  },
];

const allProducts = [];
