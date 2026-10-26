import type { Request, Response } from "express";
import { Payment } from "../models/Payment.js";

export async function getPayments(req: Request, res: Response): Promise<void> {
  try {
    const { status, search } = req.query as Record<string, string | undefined>;
    const query: any = {};

    if (status && status !== "all") {
      query.status = status;
    }

    if (search && search.trim() !== "") {
      const regex = new RegExp(search.trim(), "i");
      query.$or = [{ transactionId: regex }, { orderRef: regex }, { customerName: regex }];
    }

    const payments = await Payment.find(query).sort({ createdAt: -1 });
    res.json({ success: true, count: payments.length, data: payments });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function createPayment(req: Request, res: Response): Promise<void> {
  try {
    const data = req.body;
    if (!data.orderId || !data.amount) {
      res.status(400).json({ success: false, message: "orderId and amount are required" });
      return;
    }

    const transactionId = data.transactionId || `TXN-${Math.floor(100000 + Math.random() * 900000)}`;
    const payment = await Payment.create({
      ...data,
      transactionId,
    });

    res.status(201).json({ success: true, message: "Payment recorded", data: payment });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function updatePaymentStatus(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const payment = await Payment.findByIdAndUpdate(id, { status }, { new: true });
    if (!payment) {
      res.status(404).json({ success: false, message: "Payment not found" });
      return;
    }

    res.json({ success: true, message: "Payment status updated", data: payment });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}
