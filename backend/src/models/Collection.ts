import mongoose, { Document, Schema } from "mongoose";

export interface ICollection extends Document {
  name: string;
  slug: string;
  description?: string;
  productIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

const CollectionSchema = new Schema<ICollection>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, default: "" },
    productIds: [{ type: String }],
  },
  { timestamps: true }
);

export const Collection = mongoose.model<ICollection>("Collection", CollectionSchema);
