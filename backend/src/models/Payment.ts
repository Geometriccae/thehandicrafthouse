import mongoose, { Document, Schema } from "mongoose";
import type { PaymentMethod, PaymentStatus } from "./Order.js";

export interface IAdminPayment extends Document {
  transactionId: string;
  orderId: string;
  orderRef: string;
  customerId: string;
  customerName: string;
  amount: number;
  method: PaymentMethod;
  status: Exclude<PaymentStatus, "cod"> | "paid" | "pending" | "failed" | "refunded";
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IAdminPayment>(
  {
    transactionId: { type: String, required: true },
    orderId: { type: String, required: true },
    orderRef: { type: String, required: true },
    customerId: { type: String, default: "" },
    customerName: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
    method: {
      type: String,
      enum: ["razorpay", "upi", "card", "netbanking", "cod"],
      default: "razorpay",
    },
    status: {
      type: String,
      enum: ["paid", "pending", "failed", "refunded"],
      default: "pending",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

PaymentSchema.index({ transactionId: 1 }, { unique: true });
PaymentSchema.index({ orderId: 1 });
PaymentSchema.index({ status: 1 });
PaymentSchema.index({ createdAt: -1 });

export const Payment = mongoose.model<IAdminPayment>("Payment", PaymentSchema);
