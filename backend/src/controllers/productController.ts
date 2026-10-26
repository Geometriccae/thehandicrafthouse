import type { Request, Response } from "express";
import { Product } from "../models/Product.js";

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
      query.categoryId = category;
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
      Product.find(query).sort(sortOptions).skip(skip).limit(limitNum),
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

    let product = await Product.findOne({
      $or: [
        ...(data._id && data._id.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: data._id }] : []),
        { sku: cleanSku },
      ],
    });

    const normalizedData = {
      ...data,
      name,
      sku: cleanSku,
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
    let product = null;
    if (id && id.match(/^[0-9a-fA-F]{24}$/)) {
      product = await Product.findByIdAndUpdate(id, { status: "deleted" }, { new: true });
    }
    if (!product) {
      product = await Product.findOneAndUpdate({ sku: id.toUpperCase() }, { status: "deleted" }, { new: true });
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
    let product = null;
    if (id && id.match(/^[0-9a-fA-F]{24}$/)) {
      product = await Product.findByIdAndUpdate(id, { status: "active" }, { new: true });
    }
    if (!product) {
      product = await Product.findOneAndUpdate({ sku: id.toUpperCase() }, { status: "active" }, { new: true });
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
    let product = null;
    if (id && id.match(/^[0-9a-fA-F]{24}$/)) {
      product = await Product.findByIdAndDelete(id);
    }
    if (!product) {
      product = await Product.findOneAndDelete({ sku: id.toUpperCase() });
    }

    if (!product) {
      res.status(404).json({ success: false, message: "Product not found" });
      return;
    }
    res.json({ success: true, message: "Product permanently deleted" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}
