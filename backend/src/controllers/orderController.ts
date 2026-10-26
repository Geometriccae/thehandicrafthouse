import type { Request, Response } from "express";
import { Order, type OrderStatus } from "../models/Order.js";
import { Payment } from "../models/Payment.js";
import { Product } from "../models/Product.js";

function generateOrderId(): string {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `ORD-${dateStr}-${rand}`;
}

export async function getOrders(req: Request, res: Response): Promise<void> {
  try {
    const {
      status,
      paymentStatus,
      customerId,
      search,
      page = "1",
      limit = "100",
    } = req.query as Record<string, string | undefined>;

    const query: any = {};

    if (status && status !== "all") {
      query.orderStatus = status;
    }

    if (paymentStatus && paymentStatus !== "all") {
      query.paymentStatus = paymentStatus;
    }

    if (customerId) {
      query.customerId = customerId;
    }

    if (search && search.trim() !== "") {
      const regex = new RegExp(search.trim(), "i");
      query.$or = [{ orderId: regex }, { customerName: regex }, { customerEmail: regex }];
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, parseInt(limit, 10));
    const skip = (pageNum - 1) * limitNum;

    const [orders, total] = await Promise.all([
      Order.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      Order.countDocuments(query),
    ]);

    res.json({
      success: true,
      count: orders.length,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      data: orders,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function getOrderById(req: Request, res: Response): Promise<void> {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!id) {
      res.status(400).json({ success: false, message: "Order id is required" });
      return;
    }
    let order = null;

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      order = await Order.findById(id);
    }

    if (!order) {
      order = await Order.findOne({ orderId: id.toUpperCase() });
    }

    if (!order) {
      res.status(404).json({ success: false, message: "Order not found" });
      return;
    }

    res.json({ success: true, data: order });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function createOrder(req: Request, res: Response): Promise<void> {
  try {
    const data = req.body;
    if (!data.items || data.items.length === 0) {
      res.status(400).json({ success: false, message: "Order must contain at least one item" });
      return;
    }

    const orderId = data.orderId || generateOrderId();
    const subtotal = data.items.reduce(
      (acc: number, item: any) => acc + item.price * item.quantity,
      0
    );
    const shipping = data.shipping !== undefined ? data.shipping : subtotal > 250 ? 0 : 18;
    const discount = data.discount || 0;
    const tax = data.tax || 0;
    const total = Math.max(0, subtotal - discount + shipping + tax);

    const now = new Date().toISOString();
    const timeline = data.timeline || [
      { label: "Order Placed", at: now, done: true },
      { label: "Processing", at: now, done: false },
      { label: "Dispatched", at: "", done: false },
      { label: "Delivered", at: "", done: false },
    ];

    const order = await Order.create({
      ...data,
      orderId,
      subtotal,
      shipping,
      discount,
      tax,
      total,
      timeline,
      orderStatus: data.orderStatus || "new",
      paymentStatus: data.paymentStatus || (data.paymentMethod === "cod" ? "cod" : "pending"),
    });

    // Optionally deduct product stock
    for (const item of data.items) {
      if (item.productId) {
        await Product.updateOne(
          { $or: [{ _id: item.productId }, { sku: item.productId }] },
          { $inc: { stock: -item.quantity } }
        );
      }
    }

    // Record payment entry if paid
    if (order.paymentStatus === "paid") {
      await Payment.create({
        transactionId: `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
        orderId: order._id.toString(),
        orderRef: order.orderId,
        customerId: order.customerId,
        customerName: order.customerName,
        amount: order.total,
        method: order.paymentMethod,
        status: "paid",
      });
    }

    res.status(201).json({ success: true, message: "Order created successfully", data: order });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function updateOrderStatus(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { status } = req.body as { status: OrderStatus };

    const order = await Order.findById(id);
    if (!order) {
      res.status(404).json({ success: false, message: "Order not found" });
      return;
    }

    order.orderStatus = status;

    // Update timeline based on status
    const now = new Date().toISOString();
    const updatedTimeline = order.timeline.map((step) => {
      if (status === "processing" && step.label === "Processing") {
        return { ...step, at: now, done: true };
      }
      if (status === "shipped" && (step.label === "Processing" || step.label === "Dispatched")) {
        return { ...step, at: step.at || now, done: true };
      }
      if (status === "delivered") {
        return { ...step, at: step.at || now, done: true };
      }
      return step;
    });

    order.timeline = updatedTimeline;
    await order.save();

    res.json({ success: true, message: "Order status updated", data: order });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function softDeleteOrder(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const order = await Order.findByIdAndUpdate(id, { orderStatus: "deleted" }, { new: true });
    if (!order) {
      res.status(404).json({ success: false, message: "Order not found" });
      return;
    }
    res.json({ success: true, message: "Order moved to deleted", data: order });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function restoreOrder(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const order = await Order.findByIdAndUpdate(id, { orderStatus: "new" }, { new: true });
    if (!order) {
      res.status(404).json({ success: false, message: "Order not found" });
      return;
    }
    res.json({ success: true, message: "Order restored to new", data: order });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function hardDeleteOrder(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const order = await Order.findByIdAndDelete(id);
    if (!order) {
      res.status(404).json({ success: false, message: "Order not found" });
      return;
    }
    res.json({ success: true, message: "Order permanently deleted" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}
