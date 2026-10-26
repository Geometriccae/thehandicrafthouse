import type { Request, Response } from "express";
import { Collection } from "../models/Collection.js";

export async function getCollections(req: Request, res: Response): Promise<void> {
  try {
    const collections = await Collection.find().sort({ createdAt: 1 });
    res.json({ success: true, count: collections.length, data: collections });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function createCollection(req: Request, res: Response): Promise<void> {
  try {
    const { name, slug, description, productIds } = req.body;
    if (!name || !slug) {
      res.status(400).json({ success: false, message: "Collection name and slug are required" });
      return;
    }

    const cleanSlug = slug.toLowerCase().trim();
    const existing = await Collection.findOne({ slug: cleanSlug });
    if (existing) {
      res.status(409).json({ success: false, message: "Collection slug already exists" });
      return;
    }

    const collection = await Collection.create({
      name,
      slug: cleanSlug,
      description,
      productIds: productIds || [],
    });

    res.status(201).json({ success: true, message: "Collection created", data: collection });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function updateCollection(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const collection = await Collection.findByIdAndUpdate(id, req.body, { new: true });
    if (!collection) {
      res.status(404).json({ success: false, message: "Collection not found" });
      return;
    }
    res.json({ success: true, message: "Collection updated", data: collection });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function deleteCollection(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const collection = await Collection.findByIdAndDelete(id);
    if (!collection) {
      res.status(404).json({ success: false, message: "Collection not found" });
      return;
    }
    res.json({ success: true, message: "Collection deleted" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}
