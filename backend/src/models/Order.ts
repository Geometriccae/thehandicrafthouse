import mongoose, { Document, Schema } from "mongoose";

export type OrderStatus =
  | "new"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "deleted";

export type PaymentStatus = "paid" | "pending" | "failed" | "refunded" | "cod";
export type PaymentMethod = "razorpay" | "upi" | "card" | "netbanking" | "cod";

export interface IOrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  image?: string;
}

export interface IAdminOrder extends Document {
  orderId: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: IOrderItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  orderStatus: OrderStatus;
  shippingAddress: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pincode: string;
  };
  timeline: { label: string; at: string; done: boolean }[];
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    productId: { type: String, required: true },
    name: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
    image: { type: String, default: "" },
  },
  { _id: false }
);

const TimelineSchema = new Schema(
  {
    label: { type: String, required: true },
    at: { type: String, required: true },
    done: { type: Boolean, default: false },
  },
  { _id: false }
);

const ShippingAddressSchema = new Schema(
  {
    line1: { type: String, required: true },
    line2: { type: String, default: "" },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
  },
  { _id: false }
);

const OrderSchema = new Schema<IAdminOrder>(
  {
    orderId: { type: String, required: true },
    customerId: { type: String, default: "guest" },
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true },
    customerPhone: { type: String, default: "" },
    items: [OrderItemSchema],
    subtotal: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    shipping: { type: Number, default: 0, min: 0 },
    tax: { type: Number, default: 0, min: 0 },
    total: { type: Number, required: true, min: 0 },
    paymentStatus: {
      type: String,
      enum: ["paid", "pending", "failed", "refunded", "cod"],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      enum: ["razorpay", "upi", "card", "netbanking", "cod"],
      default: "cod",
    },
    orderStatus: {
      type: String,
      enum: ["new", "processing", "shipped", "delivered", "cancelled", "deleted"],
      default: "new",
    },
    shippingAddress: { type: ShippingAddressSchema, required: true },
    timeline: [TimelineSchema],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

OrderSchema.index({ orderId: 1 }, { unique: true });
OrderSchema.index({ customerId: 1 });
OrderSchema.index({ orderStatus: 1 });
OrderSchema.index({ paymentStatus: 1 });
OrderSchema.index({ createdAt: -1 });

export const Order = mongoose.model<IAdminOrder>("Order", OrderSchema);
