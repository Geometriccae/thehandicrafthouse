import type { Request, Response } from "express";
import { Order } from "../models/Order.js";
import { Product } from "../models/Product.js";
import { User } from "../models/User.js";

function getStartDate(range: string): Date {
  const now = new Date();
  if (range === "7d") return new Date(now.getTime() - 7 * 86400000);
  if (range === "30d") return new Date(now.getTime() - 30 * 86400000);
  if (range === "month") return new Date(now.getFullYear(), now.getMonth(), 1);
  if (range === "year") return new Date(now.getFullYear(), 0, 1);
  return new Date(now.getTime() - 30 * 86400000);
}

export async function getDashboardStats(req: Request, res: Response): Promise<void> {
  try {
    const range = (req.query.range as string) || "30d";
    const startDate = getStartDate(range);

    const [allOrders, activeProducts, customersCount] = await Promise.all([
      Order.find({ orderStatus: { $ne: "deleted" } }).sort({ createdAt: -1 }),
      Product.find({ status: "active" }),
      User.countDocuments({ role: "customer" }),
    ]);

    const rangedOrders = allOrders.filter((o) => new Date(o.createdAt) >= startDate);
    const revenue = rangedOrders
      .filter((o) => o.paymentStatus === "paid" || o.orderStatus === "delivered")
      .reduce((sum, o) => sum + o.total, 0);

    const pendingOrders = allOrders.filter(
      (o) => o.orderStatus === "new" || o.orderStatus === "processing"
    ).length;

    const lowStockProducts = activeProducts.filter(
      (p) => p.stock <= (p.lowStockThreshold || 5)
    );

    // Sales timeline chart grouping
    const chartMap = new Map<string, number>();
    rangedOrders.forEach((o) => {
      const dateKey = new Date(o.createdAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
      });
      chartMap.set(dateKey, (chartMap.get(dateKey) || 0) + o.total);
    });
    const chart = Array.from(chartMap.entries()).map(([name, value]) => ({ name, value }));

    // Top selling products
    const productSales = new Map<string, { name: string; qty: number; revenue: number }>();
    allOrders.forEach((o) => {
      o.items.forEach((item) => {
        const cur = productSales.get(item.productId) || {
          name: item.name,
          qty: 0,
          revenue: 0,
        };
        cur.qty += item.quantity;
        cur.revenue += item.price * item.quantity;
        productSales.set(item.productId, cur);
      });
    });
    const topProducts = Array.from(productSales.values())
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);

    res.json({
      success: true,
      data: {
        totalOrders: allOrders.length,
        revenue,
        pending: pendingOrders,
        customers: customersCount,
        products: activeProducts.length,
        lowStockCount: lowStockProducts.length,
        chart,
        recent: allOrders.slice(0, 5),
        topProducts,
        lowStock: lowStockProducts.slice(0, 5),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}
