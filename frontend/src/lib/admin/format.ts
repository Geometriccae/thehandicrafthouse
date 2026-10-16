import type { AdminProduct, OrderStatus, PaymentStatus, StockStatus } from "./types";

export function formatINR(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(iso: string) {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

export function formatDateTime(iso: string) {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function stockStatus(product: Pick<AdminProduct, "stock" | "lowStockThreshold">): StockStatus {
  if (product.stock <= 0) return "out_of_stock";
  if (product.stock <= product.lowStockThreshold) return "low_stock";
  return "in_stock";
}

export function stockLabel(status: StockStatus) {
  switch (status) {
    case "in_stock":
      return "In Stock";
    case "low_stock":
      return "Low Stock";
    case "out_of_stock":
      return "Out of Stock";
  }
}

export function orderStatusLabel(status: OrderStatus) {
  const map: Record<OrderStatus, string> = {
    new: "New",
    processing: "Processing",
    shipped: "Shipped",
    delivered: "Delivered",
    cancelled: "Cancelled",
    deleted: "Deleted",
  };
  return map[status];
}

export function paymentStatusLabel(status: PaymentStatus) {
  const map: Record<PaymentStatus, string> = {
    paid: "Paid",
    pending: "Pending",
    failed: "Failed",
    refunded: "Refunded",
    cod: "COD",
  };
  return map[status];
}

export function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

export const DEMO_ADMIN = {
  email: "admin@demo.com",
  password: "123456",
};
