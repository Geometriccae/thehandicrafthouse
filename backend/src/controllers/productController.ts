import type { Request, Response } from "express";
import { Product } from "../models/Product.js";

function getCategoryAliases(cat: string): string[] {
  const clean = cat.toLowerCase().trim().replace(/^cat_/, "");
  const aliases = new Set<string>([cat, clean, `cat_${clean}`]);
  if (clean.includes("light")) {
    ["lighting", "cat_lighting", "Lighting", "lights"].forEach((a) => aliases.add(a));
  } else if (clean.includes("kitchen") || clean.includes("dining")) {
    ["kitchen", "cat_kitchen", "Kitchen", "Kitchen & Dining", "kitchenware"].forEach((a) => aliases.add(a));
  } else if (clean.includes("storage") || clean.includes("basket")) {
    ["storage", "cat_storage", "Storage", "Storage & Baskets", "baskets"].forEach((a) => aliases.add(a));
  } else if (clean.includes("furnitur") || clean.includes("chair") || clean.includes("table")) {
    ["furniture", "cat_furniture", "Furniture"].forEach((a) => aliases.add(a));
  } else if (clean.includes("office") || clean.includes("desk")) {
    ["office", "cat_office", "Office", "Office & Desk"].forEach((a) => aliases.add(a));
  } else if (clean.includes("decor") || clean.includes("décor") || clean.includes("wall")) {
    ["decor", "cat_decor", "Home Decor", "Home Décor", "decorating"].forEach((a) => aliases.add(a));
  } else if (clean.includes("gift")) {
    ["gifting", "gifts", "cat_gifts", "cat_gifting", "Gifting", "Gifts"].forEach((a) => aliases.add(a));
  }
  return Array.from(aliases);
}

export async function getProducts(req: Request, res: Response): Promise<void> {
  try {
    const {
      category,
      status,
      stock,
      sort,
      search,
      page = "1",
      limit = "100",
    } = req.query as Record<string, string | undefined>;

    const query: any = {};

    // By default storefront fetches only active products unless status is explicitly passed (e.g. from admin)
    if (status) {
      if (status !== "all") query.status = status;
    } else {
      query.status = "active";
    }

    if (category && category !== "all") {
      const aliases = getCategoryAliases(category);
      query.$or = [
        { categoryId: { $in: aliases } },
        { category: { $in: aliases } },
      ];
    }

    if (stock) {
      if (stock === "in_stock") {
        query.stock = { $gt: 5 };
      } else if (stock === "low_stock") {
        query.stock = { $gt: 0, $lte: 5 };
      } else if (stock === "out_of_stock") {
        query.stock = 0;
      }
    }

    if (search && search.trim() !== "") {
      const regex = new RegExp(search.trim(), "i");
      query.$or = [{ name: regex }, { sku: regex }, { description: regex }, { artisan: regex }];
    }

    let sortOptions: any = { createdAt: -1 };
    if (sort === "low") sortOptions = { price: 1 };
    if (sort === "high") sortOptions = { price: -1 };
    if (sort === "rating") sortOptions = { rating: -1 };
    if (sort === "featured") sortOptions = { rating: -1, createdAt: -1 };

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, parseInt(limit, 10));
    const skip = (pageNum - 1) * limitNum;

    const [products, total] = await Promise.all([
      Product.find(query).sort(sortOptions).skip(skip).limit(limitNum).lean(),
      Product.countDocuments(query),
    ]);

    res.json({
      success: true,
      count: products.length,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      data: products,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function getProductById(req: Request, res: Response): Promise<void> {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!id) {
      res.status(400).json({ success: false, message: "Product id is required" });
      return;
    }
    let product = null;

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      product = await Product.findById(id);
    }

    if (!product) {
      product = await Product.findOne({
        $or: [{ sku: id.toUpperCase() }, { name: new RegExp(`^${id}$`, "i") }],
      });
    }

    if (!product) {
      res.status(404).json({ success: false, message: "Product not found" });
      return;
    }

    res.json({ success: true, data: product });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function createProduct(req: Request, res: Response): Promise<void> {
  try {
    const data = req.body || {};
    const name = (data.name || data.title || "").trim();
    if (!name || data.price === undefined) {
      res.status(400).json({ success: false, message: "Name/title and price are required" });
      return;
    }

    const cleanSku = (data.sku || `SKU-${Date.now().toString(36)}`).toUpperCase().trim();
    const categoryId = data.categoryId || data.category || "lighting";

    // 1. Check if product already exists by MongoDB _id (if valid ObjectId)
    let product = null;
    if (data._id && data._id.match(/^[0-9a-fA-F]{24}$/)) {
      product = await Product.findById(data._id);
    }

    // 2. Or check by unique SKU
    if (!product && cleanSku) {
      product = await Product.findOne({ sku: cleanSku });
    }

    // 3. Prevent rapid duplicate submissions: If an identical product with the exact same
    // name, category, and price was created within the last 2 minutes, return existing record
    if (!product && name) {
      const twoMinutesAgo = new Date(Date.now() - 120 * 1000);
      product = await Product.findOne({
        name: { $regex: new RegExp(`^${escapeRegex(name)}$`, "i") },
        categoryId,
        price: Number(data.price),
        createdAt: { $gte: twoMinutesAgo },
        status: { $ne: "deleted" },
      });
    }

    const normalizedData = {
      ...data,
      name,
      sku: product?.sku || cleanSku,
      categoryId,
      price: Number(data.price),
      stock: data.stock !== undefined ? Number(data.stock) : 10,
      image: data.image || (data.images && data.images[0]) || "",
      images: data.images && data.images.length > 0 ? data.images : data.image ? [data.image] : [],
    };

    if (product) {
      Object.assign(product, normalizedData);
      await product.save();
      res.json({ success: true, message: "Product updated successfully", data: product });
      return;
    }

    const { _id, ...rest } = normalizedData;
    const createPayload = _id && _id.match(/^[0-9a-fA-F]{24}$/) ? { ...rest, _id } : rest;

    product = await Product.create(createPayload);

    res.status(201).json({ success: true, message: "Product created successfully", data: product });
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(409).json({
        success: false,
        message: `A product with SKU "${req.body?.sku || "specified"}" already exists. Please choose a unique SKU.`,
      });
      return;
    }
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function updateProduct(req: Request, res: Response): Promise<void> {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const data = req.body;

    let product = null;
    if (id && id.match(/^[0-9a-fA-F]{24}$/)) {
      product = await Product.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    }
    if (!product && (data.sku || id)) {
      const searchSku = (data.sku || id).toUpperCase().trim();
      product = await Product.findOneAndUpdate({ sku: searchSku }, data, { new: true, runValidators: true });
    }

    if (!product) {
      res.status(404).json({ success: false, message: "Product not found" });
      return;
    }

    res.json({ success: true, message: "Product updated successfully", data: product });
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(409).json({
        success: false,
        message: `A product with SKU "${req.body?.sku || "specified"}" already exists. Please choose a unique SKU.`,
      });
      return;
    }
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function updateStock(req: Request, res: Response): Promise<void> {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { stock, lowStockThreshold } = req.body;

    if (stock === undefined || stock < 0) {
      res.status(400).json({ success: false, message: "Valid stock value is required" });
      return;
    }

    const updates: any = { stock };
    if (lowStockThreshold !== undefined) updates.lowStockThreshold = lowStockThreshold;

    let product = null;
    if (id && id.match(/^[0-9a-fA-F]{24}$/)) {
      product = await Product.findByIdAndUpdate(id, updates, { new: true });
    }
    if (!product) {
      product = await Product.findOneAndUpdate({ sku: id.toUpperCase() }, updates, { new: true });
    }

    if (!product) {
      res.status(404).json({ success: false, message: "Product not found" });
      return;
    }

    res.json({ success: true, message: "Stock updated", data: product });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function softDeleteProduct(req: Request, res: Response): Promise<void> {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const skuParam = (req.query.sku as string) || (req.body?.sku as string);
    let product = null;
    if (id && id.match(/^[0-9a-fA-F]{24}$/)) {
      product = await Product.findByIdAndUpdate(id, { status: "deleted" }, { new: true });
    }
    if (!product && skuParam) {
      product = await Product.findOneAndUpdate({ sku: skuParam.toUpperCase().trim() }, { status: "deleted" }, { new: true });
    }
    if (!product && id) {
      product = await Product.findOneAndUpdate({ sku: id.toUpperCase().trim() }, { status: "deleted" }, { new: true });
    }

    if (!product) {
      res.status(404).json({ success: false, message: "Product not found" });
      return;
    }
    res.json({ success: true, message: "Product moved to deleted tab", data: product });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function restoreProduct(req: Request, res: Response): Promise<void> {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const skuParam = (req.query.sku as string) || (req.body?.sku as string);
    let product = null;
    if (id && id.match(/^[0-9a-fA-F]{24}$/)) {
      product = await Product.findByIdAndUpdate(id, { status: "active" }, { new: true });
    }
    if (!product && skuParam) {
      product = await Product.findOneAndUpdate({ sku: skuParam.toUpperCase().trim() }, { status: "active" }, { new: true });
    }
    if (!product && id) {
      product = await Product.findOneAndUpdate({ sku: id.toUpperCase().trim() }, { status: "active" }, { new: true });
    }

    if (!product) {
      res.status(404).json({ success: false, message: "Product not found" });
      return;
    }
    res.json({ success: true, message: "Product restored to active status", data: product });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function hardDeleteProduct(req: Request, res: Response): Promise<void> {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const skuParam = (req.query.sku as string) || (req.body?.sku as string);
    let product = null;
    if (id && id.match(/^[0-9a-fA-F]{24}$/)) {
      product = await Product.findByIdAndDelete(id);
    }
    if (!product && skuParam) {
      product = await Product.findOneAndDelete({ sku: skuParam.toUpperCase().trim() });
    }
    if (!product && id) {
      product = await Product.findOneAndDelete({ sku: id.toUpperCase().trim() });
    }

    // Always succeed so the product is purged from UI even if already removed from DB
    res.json({ success: true, message: "Product permanently deleted" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}
