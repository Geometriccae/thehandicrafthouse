import lamp from "@/assets/p-lamp.jpg";
import kitchen from "@/assets/p-kitchen.jpg";
import storage from "@/assets/p-storage.jpg";
import chair from "@/assets/p-chair.jpg";
import office from "@/assets/p-office.jpg";
import decor from "@/assets/p-decor.jpg";
import gift from "@/assets/p-gift.jpg";
import { getApiBaseUrl, PRODUCTION_API_URL } from "@/lib/api";

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
  sku?: string;
};

export type CategoryId =
  | "lighting"
  | "kitchen"
  | "storage"
  | "furniture"
  | "office"
  | "decor"
  | "gifting";

export function normalizeCategoryId(raw: string | undefined | null): CategoryId {
  if (!raw) return "lighting";
  const s = String(raw).toLowerCase().trim().replace(/^cat_/, "");
  if (s.includes("light")) return "lighting";
  if (s.includes("kitchen") || s.includes("dining")) return "kitchen";
  if (s.includes("storage") || s.includes("basket")) return "storage";
  if (s.includes("furnitur") || s.includes("chair") || s.includes("table")) return "furniture";
  if (s.includes("office") || s.includes("desk")) return "office";
  if (s.includes("decor") || s.includes("décor") || s.includes("wall")) return "decor";
  if (s.includes("gift")) return "gifting";
  return "lighting";
}

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

const STORE_PRODUCTS_CACHE_KEY = "thh-store-products-v2";

export function getCachedStoreProducts(): Product[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORE_PRODUCTS_CACHE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function setCachedStoreProducts(list: Product[]): void {
  if (typeof window === "undefined") return;
  try {
    const safe = list.map((p) => ({
      ...p,
      image: p.image && p.image.length > 200000 ? p.image.slice(0, 100) : p.image,
      images: (p as any).images
        ? (p as any).images.map((img: string) => (img.length > 200000 ? img.slice(0, 100) : img))
        : [],
    }));
    localStorage.setItem(STORE_PRODUCTS_CACHE_KEY, JSON.stringify(safe));
  } catch (e) {
    console.warn("[Products] Could not cache store products to localStorage:", e);
  }
}

// Live products array populated from cache and synchronized with MongoDB Atlas
export const products: Product[] = typeof window !== "undefined" ? getCachedStoreProducts() : [];

export function formatBackendProduct(p: any): Product {
  const fallbackImg = lamp;
  return {
    id: p._id || p.id || p.sku,
    name: p.name || "",
    tagline: p.tagline || (p.description ? p.description.slice(0, 80) : ""),
    price: Number(p.price) || 0,
    compareAt: p.compareAt ? Number(p.compareAt) : p.discountPrice ? Number(p.discountPrice) : undefined,
    category: normalizeCategoryId(p.categoryId || p.category),
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
    sku: p.sku || "",
  };
}

export function setGlobalProducts(list: any[]): Product[] {
  const formatted = list.map(formatBackendProduct);
  products.length = 0;
  products.push(...formatted);
  setCachedStoreProducts(formatted);
  return formatted;
}

export async function fetchStoreProducts(): Promise<Product[]> {
  try {
    const baseUrl = getApiBaseUrl();
    let res = await fetch(`${baseUrl}/products?limit=100`).catch(() => null);

    // If local proxy failed and we are on localhost, fallback to PRODUCTION_API_URL
    if (
      (!res || !res.ok) &&
      typeof window !== "undefined" &&
      (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
    ) {
      res = await fetch(`${PRODUCTION_API_URL}/products?limit=100`).catch(() => null);
    }

    if (res && res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        return setGlobalProducts(json.data);
      }
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
