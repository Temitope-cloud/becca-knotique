import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Clock } from "lucide-react";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const icons = {
  yarn: "🧶",
  money: "💰",
};

const phone = "2348029086678";

function buildWhatsAppMessage(product: any) {
  return `Hello, I want to order this crochet piece:

 Product: ${product.name}
 Price: ₦${product.price.toLocaleString()}

Please I’d like to know more about it.`;
}

export function getWhatsAppLink(product: any) {
  const message = buildWhatsAppMessage(product);
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
