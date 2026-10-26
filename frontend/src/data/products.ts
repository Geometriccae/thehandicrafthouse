import lamp from "@/assets/p-lamp.jpg";
import kitchen from "@/assets/p-kitchen.jpg";
import storage from "@/assets/p-storage.jpg";
import chair from "@/assets/p-chair.jpg";
import office from "@/assets/p-office.jpg";
import decor from "@/assets/p-decor.jpg";
import gift from "@/assets/p-gift.jpg";

export type Product = {
  id: string;
  name: string;
  tagline: string;
  price: number;
  compareAt?: number | undefined;
  category: CategoryId;
  image: string;
  rating: number;
  reviews: number;
  badge?: string | undefined;
  artisan: string;
  origin: string;
  story: string;
  details: string[];
  care: string;
  dimensions: string;
  stock: number;
};

export type CategoryId =
  | "lighting"
  | "kitchen"
  | "storage"
  | "furniture"
  | "office"
  | "decor"
  | "gifting";

export const categories: {
  id: CategoryId;
  name: string;
  blurb: string;
  image: string;
}[] = [
  { id: "lighting", name: "Lighting", blurb: "Woven glow for quiet evenings", image: lamp },
  { id: "kitchen", name: "Kitchen & Dining", blurb: "Everyday rituals, elevated", image: kitchen },
  { id: "storage", name: "Storage & Baskets", blurb: "Order with warmth", image: storage },
  { id: "furniture", name: "Furniture", blurb: "Light frames, long lives", image: chair },
  { id: "office", name: "Office & Desk", blurb: "Calm, focused surfaces", image: office },
  { id: "decor", name: "Home Décor", blurb: "Texture on every wall", image: decor },
  { id: "gifting", name: "Gifting", blurb: "Thoughtful, wrapped in care", image: gift },
];

// Live products array populated from MongoDB Atlas
export const products: Product[] = [];

export function formatBackendProduct(p: any): Product {
  const fallbackImg = lamp;
  return {
    id: p._id || p.id || p.sku,
    name: p.name || "",
    tagline: p.tagline || (p.description ? p.description.slice(0, 80) : ""),
    price: Number(p.price) || 0,
    compareAt: p.compareAt ? Number(p.compareAt) : p.discountPrice ? Number(p.discountPrice) : undefined,
    category: (p.categoryId || p.category || "lighting") as CategoryId,
    image: p.image || (p.images && p.images[0]) || fallbackImg,
    rating: Number(p.rating) || 5,
    reviews: Number(p.reviews) || 0,
    badge: p.badge || (p.stock <= (p.lowStockThreshold || 5) && p.stock > 0 ? "Low Stock" : ""),
    artisan: p.artisan || "Independent Artisan",
    origin: p.origin || "India",
    story: p.story || p.description || "",
    details: Array.isArray(p.details) && p.details.length > 0 ? p.details : [p.material || "Natural Bamboo", p.craftType || "Handmade"],
    care: p.care || p.careInstructions || "Wipe clean with a soft dry cloth.",
    dimensions: p.dimensions || "",
    stock: Number(p.stock) || 0,
  };
}

export function setGlobalProducts(list: any[]): Product[] {
  const formatted = list.map(formatBackendProduct);
  products.length = 0;
  products.push(...formatted);
  return formatted;
}

export async function fetchStoreProducts(): Promise<Product[]> {
  try {
    const res = await fetch("/api/products?limit=100");
    const json = await res.json();
    if (json.success && Array.isArray(json.data)) {
      return setGlobalProducts(json.data);
    }
  } catch (err) {
    console.warn("[Products] Could not fetch products from server:", err);
  }
  return products;
}

export function getProduct(id: string) {
  return products.find((p) => p.id === id);
}

export function formatPrice(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}
