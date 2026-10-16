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
  compareAt?: number;
  category: CategoryId;
  image: string;
  rating: number;
  reviews: number;
  badge?: string;
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

export const products: Product[] = [
  {
    id: "hoshi-pendant-lamp",
    name: "Hoshi Woven Pendant Lamp",
    tagline: "Hand-coiled bamboo shade that scatters light like dappled forest sun.",
    price: 189,
    compareAt: 229,
    category: "lighting",
    image: lamp,
    rating: 4.9,
    reviews: 128,
    badge: "Bestseller",
    artisan: "Meera Devi",
    origin: "Assam, India",
    story:
      "Each shade is coiled from a single split culm over nine hours, then cured with a plant-based wax that deepens the honey tone with age.",
    details: [
      "Hand-split Bambusa tulda, naturally cured",
      "Plant-based wax finish, zero VOC",
      "E27 fitting, 2m braided cotton cord",
    ],
    care: "Dust with a dry brush. Keep away from prolonged damp.",
    dimensions: "Ø 42 cm × H 34 cm",
    stock: 12,
  },
  {
    id: "nara-serving-board",
    name: "Nara Serving Board Set",
    tagline: "Three graduated boards pressed from laminated bamboo.",
    price: 74,
    category: "kitchen",
    image: kitchen,
    rating: 4.8,
    reviews: 96,
    badge: "New",
    artisan: "Thanh Pham",
    origin: "Hue, Vietnam",
    story:
      "Bamboo is harvested at four years, the exact age its fibre density rivals hardwood, then pressed cold to keep the grain honest.",
    details: ["Set of three boards", "Food-safe linseed oil finish", "Knife-friendly end grain"],
    care: "Hand wash, dry upright, re-oil monthly.",
    dimensions: "38 / 30 / 22 cm long",
    stock: 34,
  },
  {
    id: "ola-storage-basket",
    name: "Ola Lidded Storage Basket",
    tagline: "A generous woven vessel with a soft, sculpted lid.",
    price: 118,
    category: "storage",
    image: storage,
    rating: 4.9,
    reviews: 211,
    badge: "Bestseller",
    artisan: "Sri Wahyuni",
    origin: "Bali, Indonesia",
    story:
      "Woven in a village cooperative where the pattern has passed through four generations of women weavers.",
    details: ["Twill weave with reinforced rim", "Cotton-lined interior", "Nests with the Ola small"],
    care: "Vacuum gently. Spot clean with a damp cloth.",
    dimensions: "Ø 40 cm × H 45 cm",
    stock: 18,
  },
  {
    id: "kaze-lounge-chair",
    name: "Kaze Bent Bamboo Lounge Chair",
    tagline: "Steam-bent frame with a hand-knotted seat that flexes as you sit.",
    price: 640,
    compareAt: 720,
    category: "furniture",
    image: chair,
    rating: 5,
    reviews: 47,
    badge: "Limited",
    artisan: "Kenji Aoki",
    origin: "Kyoto, Japan",
    story:
      "Forty hours of steaming, bending and binding. Only nine chairs leave the workshop each month.",
    details: ["Steam-bent structural bamboo", "Hand-knotted seat cord", "Tested to 140 kg"],
    care: "Indoor use. Wipe with a soft dry cloth.",
    dimensions: "W 72 × D 80 × H 78 cm",
    stock: 5,
  },
  {
    id: "sumi-desk-organiser",
    name: "Sumi Desk Organiser",
    tagline: "Quiet compartments for a desk that thinks clearly.",
    price: 58,
    category: "office",
    image: office,
    rating: 4.7,
    reviews: 84,
    artisan: "Lin Zhao",
    origin: "Anji, China",
    story:
      "Cut from off-cuts of our furniture line, so nothing from the culm is wasted.",
    details: ["Five compartments", "Felt-lined base", "Made from production off-cuts"],
    care: "Dry dust only.",
    dimensions: "W 28 × D 16 × H 11 cm",
    stock: 42,
  },
  {
    id: "mira-wall-panel",
    name: "Mira Woven Wall Panel",
    tagline: "A textured panel that turns a bare wall into a warm one.",
    price: 145,
    category: "decor",
    image: decor,
    rating: 4.8,
    reviews: 63,
    badge: "New",
    artisan: "Ananya Bora",
    origin: "Tripura, India",
    story:
      "The open weave was designed to cast a slow shadow that shifts through the day.",
    details: ["Hardwood hanging rod", "Natural undyed fibre", "Ready to hang"],
    care: "Dust with a soft brush.",
    dimensions: "W 60 × H 78 cm",
    stock: 21,
  },
  {
    id: "hana-gift-box",
    name: "Hana Artisan Gift Box",
    tagline: "Our four most-loved small pieces, wrapped in bamboo paper.",
    price: 96,
    compareAt: 118,
    category: "gifting",
    image: gift,
    rating: 4.9,
    reviews: 152,
    badge: "Gift ready",
    artisan: "The Handicraft House Studio",
    origin: "Curated",
    story:
      "Packed by hand with a note card naming every maker whose work is inside.",
    details: ["Four curated pieces", "Plastic-free packaging", "Personal note included"],
    care: "See each enclosed piece.",
    dimensions: "W 32 × D 22 × H 12 cm",
    stock: 27,
  },
  {
    id: "yumi-table-lamp",
    name: "Yumi Table Lamp",
    tagline: "A small companion light with a tapered woven shade.",
    price: 132,
    category: "lighting",
    image: lamp,
    rating: 4.7,
    reviews: 58,
    artisan: "Meera Devi",
    origin: "Assam, India",
    story: "A smaller sibling to the Hoshi, made for bedsides and reading corners.",
    details: ["Dimmable inline switch", "Weighted bamboo base", "Warm 2700K bulb included"],
    care: "Dust with a dry brush.",
    dimensions: "Ø 24 cm × H 40 cm",
    stock: 16,
  },
];

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
