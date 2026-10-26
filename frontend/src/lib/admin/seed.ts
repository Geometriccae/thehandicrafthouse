import type { AdminState } from "./types";

const now = new Date("2026-08-10T10:00:00+05:30");

function daysAgo(n: number, hour = 10) {
  const d = new Date(now);
  d.setDate(d.getDate() - n);
  d.setHours(hour, 15, 0, 0);
  return d.toISOString();
}

export const ADMIN_SEED: AdminState = {
  categories: [
    { _id: "cat_lighting", name: "Lighting", slug: "lighting", createdAt: daysAgo(120) },
    { _id: "cat_kitchen", name: "Kitchen", slug: "kitchen", createdAt: daysAgo(120) },
    { _id: "cat_storage", name: "Storage", slug: "storage", createdAt: daysAgo(120) },
    { _id: "cat_furniture", name: "Furniture", slug: "furniture", createdAt: daysAgo(120) },
    { _id: "cat_office", name: "Office", slug: "office", createdAt: daysAgo(120) },
    { _id: "cat_decor", name: "Home Decor", slug: "decor", createdAt: daysAgo(120) },
    { _id: "cat_gifts", name: "Gifts", slug: "gifts", createdAt: daysAgo(120) },
  ],
  collections: [],
  products: [],
  orders: [],
  payments: [],
  customers: [],
  settings: {
    store: {
      name: "The Handicraft House",
      email: "hello@handicrafthouse.com",
      phone: "+91 80 4567 8901",
      address: "Artisan Lane, Bengaluru, Karnataka 560001",
      currency: "INR",
    },
    admin: {
      name: "Store Admin",
      email: "admin@handicrafthouse.com",
    },
    shipping: {
      freeAbove: 2999,
      flatRate: 99,
      estimatedDays: "5–9 business days",
    },
    payment: {
      razorpayEnabled: true,
      upiEnabled: true,
      codEnabled: true,
    },
    notifications: {
      newOrderEmail: true,
      lowStockEmail: true,
      paymentFailedEmail: true,
    },
  },
};
