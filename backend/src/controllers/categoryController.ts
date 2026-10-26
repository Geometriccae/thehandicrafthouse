import type { Request, Response } from "express";
import { Category } from "../models/Category.js";

export async function getCategories(req: Request, res: Response): Promise<void> {
  try {
    const categories = await Category.find().sort({ createdAt: 1 });
    res.json({ success: true, count: categories.length, data: categories });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function createCategory(req: Request, res: Response): Promise<void> {
  try {
    const { name, slug, blurb, image } = req.body;
    if (!name || !slug) {
      res.status(400).json({ success: false, message: "Category name and slug are required" });
      return;
    }

    const cleanSlug = slug.toLowerCase().trim();
    const existing = await Category.findOne({ slug: cleanSlug });
    if (existing) {
      res.status(409).json({ success: false, message: "Category slug already exists" });
      return;
    }

    const category = await Category.create({ name, slug: cleanSlug, blurb, image });
    res.status(201).json({ success: true, message: "Category created", data: category });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function updateCategory(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const category = await Category.findByIdAndUpdate(id, req.body, { new: true });
    if (!category) {
      res.status(404).json({ success: false, message: "Category not found" });
      return;
    }
    res.json({ success: true, message: "Category updated", data: category });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function deleteCategory(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const category = await Category.findByIdAndDelete(id);
    if (!category) {
      res.status(404).json({ success: false, message: "Category not found" });
      return;
    }
    res.json({ success: true, message: "Category deleted" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}
