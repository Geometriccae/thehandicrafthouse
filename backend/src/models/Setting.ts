import mongoose, { Document, Schema } from "mongoose";

export interface ISetting extends Document {
  store: {
    name: string;
    email: string;
    phone: string;
    address: string;
    currency: string;
  };
  admin: {
    name: string;
    email: string;
  };
  shipping: {
    freeAbove: number;
    flatRate: number;
    estimatedDays: string;
  };
  payment: {
    razorpayEnabled: boolean;
    upiEnabled: boolean;
    codEnabled: boolean;
  };
  notifications: {
    newOrderEmail: boolean;
    lowStockEmail: boolean;
    paymentFailedEmail: boolean;
  };
  updatedAt: Date;
}

const SettingSchema = new Schema<ISetting>(
  {
    store: {
      name: { type: String, default: "The Handicraft House" },
      email: { type: String, default: "support@thehandicrafthouse.com" },
      phone: { type: String, default: "+91 98765 00000" },
      address: { type: String, default: "42 Craft Lane, Indiranagar, Bengaluru, KA 560038" },
      currency: { type: String, default: "INR" },
    },
    admin: {
      name: { type: String, default: "Store Admin" },
      email: { type: String, default: "admin@thehandicrafthouse.com" },
    },
    shipping: {
      freeAbove: { type: Number, default: 250 },
      flatRate: { type: Number, default: 18 },
      estimatedDays: { type: String, default: "3-5 business days" },
    },
    payment: {
      razorpayEnabled: { type: Boolean, default: true },
      upiEnabled: { type: Boolean, default: true },
      codEnabled: { type: Boolean, default: true },
    },
    notifications: {
      newOrderEmail: { type: Boolean, default: true },
      lowStockEmail: { type: Boolean, default: true },
      paymentFailedEmail: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

export const Setting = mongoose.model<ISetting>("Setting", SettingSchema);
