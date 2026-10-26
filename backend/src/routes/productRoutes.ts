import { Router } from "express";
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  updateStock,
  softDeleteProduct,
  restoreProduct,
  hardDeleteProduct,
} from "../controllers/productController.js";
import { authenticate, requireAdmin } from "../middleware/auth.js";

const router = Router();

// Public routes for storefront
router.get("/", getProducts);
router.get("/:id", getProductById);

// Admin-protected routes
router.post("/", authenticate, requireAdmin, createProduct);
router.put("/:id", authenticate, requireAdmin, updateProduct);
router.patch("/:id/stock", authenticate, requireAdmin, updateStock);
router.patch("/:id/soft-delete", authenticate, requireAdmin, softDeleteProduct);
router.patch("/:id/restore", authenticate, requireAdmin, restoreProduct);
router.delete("/:id", authenticate, requireAdmin, hardDeleteProduct);

export default router;
