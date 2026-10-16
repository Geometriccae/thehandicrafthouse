/**
 * Intended MongoDB collections & indexes for production.
 * The SPA currently persists via localStorage with the same document shapes.
 * Wire these to mongoose/native driver when a Node API is available.
 *
 * Collections: users, products, categories, collections, orders, payments, inventory, settings
 *
 * Indexes:
 * - products: { sku: 1 } unique, { categoryId: 1 }, { status: 1 }, { createdAt: -1 }
 * - orders: { orderId: 1 } unique, { customerId: 1 }, { orderStatus: 1 }, { paymentStatus: 1 }, { createdAt: -1 }
 * - payments: { transactionId: 1 } unique, { orderId: 1 }, { status: 1 }, { createdAt: -1 }
 * - customers/users: { email: 1 } unique
 */

export const MONGO_COLLECTIONS = [
  "users",
  "products",
  "categories",
  "collections",
  "orders",
  "payments",
  "inventory",
  "settings",
] as const;

export const MONGO_INDEXES = {
  products: [
    { key: { sku: 1 }, unique: true },
    { key: { categoryId: 1 } },
    { key: { status: 1 } },
    { key: { createdAt: -1 } },
  ],
  orders: [
    { key: { orderId: 1 }, unique: true },
    { key: { customerId: 1 } },
    { key: { orderStatus: 1 } },
    { key: { paymentStatus: 1 } },
    { key: { createdAt: -1 } },
  ],
  payments: [
    { key: { transactionId: 1 }, unique: true },
    { key: { orderId: 1 } },
    { key: { status: 1 } },
    { key: { createdAt: -1 } },
  ],
  users: [{ key: { email: 1 }, unique: true }],
} as const;
