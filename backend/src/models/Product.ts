import mongoose, { Document, Schema } from "mongoose";

export type AdminProductStatus = "active" | "inactive" | "deleted";
export type CraftType = "handwoven" | "handmade" | "machine-finished";

export interface IProduct extends Document {
  name: string;
  tagline?: string;
  description: string;
  categoryId: string;
  collectionIds: string[];
  price: number;
  discountPrice?: number;
  compareAt?: number;
  sku: string;
  images: string[];
  image?: string;
  stock: number;
  lowStockThreshold: number;
  material: string;
  dimensions: string;
  weight: string;
  color: string;
  ecoFriendly: boolean;
  craftType: CraftType;
  careInstructions: string;
  care?: string;
  artisan: string;
  origin: string;
  story: string;
  details: string[];
  rating: number;
  reviews: number;
  badge?: string;
  status: AdminProductStatus;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },
    tagline: { type: String, default: "" },
    description: { type: String, default: "" },
    categoryId: { type: String, required: true },
    collectionIds: [{ type: String }],
    price: { type: Number, required: true, min: 0 },
    discountPrice: { type: Number, min: 0 },
    compareAt: { type: Number, min: 0 },
    sku: { type: String, required: true, uppercase: true, trim: true },
    images: { type: [String], default: [] },
    image: { type: String, default: "" },
    stock: { type: Number, required: true, default: 0, min: 0 },
    lowStockThreshold: { type: Number, default: 5, min: 0 },
    material: { type: String, default: "Natural Bamboo" },
    dimensions: { type: String, default: "" },
    weight: { type: String, default: "" },
    color: { type: String, default: "Natural" },
    ecoFriendly: { type: Boolean, default: true },
    craftType: {
      type: String,
      enum: ["handwoven", "handmade", "machine-finished"],
      default: "handwoven",
    },
    careInstructions: { type: String, default: "" },
    care: { type: String, default: "" },
    artisan: { type: String, default: "Independent Artisan" },
    origin: { type: String, default: "India" },
    story: { type: String, default: "" },
    details: { type: [String], default: [] },
    rating: { type: Number, default: 5, min: 0, max: 5 },
    reviews: { type: Number, default: 0, min: 0 },
    badge: { type: String, default: "" },
    status: {
      type: String,
      enum: ["active", "inactive", "deleted"],
      default: "active",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes specified in mongo-schema.ts
ProductSchema.index({ sku: 1 }, { unique: true });
ProductSchema.index({ categoryId: 1 });
ProductSchema.index({ status: 1 });
ProductSchema.index({ createdAt: -1 });
ProductSchema.index({ name: "text", description: "text", sku: "text" });

export const Product = mongoose.model<IProduct>("Product", ProductSchema);
