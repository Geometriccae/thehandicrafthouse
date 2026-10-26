import { Router } from "express";
import {
  getOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  softDeleteOrder,
  restoreOrder,
  hardDeleteOrder,
} from "../controllers/orderController.js";
import { authenticate, requireAdmin } from "../middleware/auth.js";

const router = Router();

// Storefront / Checkout routes
router.post("/", createOrder);
router.get("/:id", getOrderById);

// Admin / protected order management routes
router.get("/", authenticate, requireAdmin, getOrders);
router.patch("/:id/status", authenticate, requireAdmin, updateOrderStatus);
router.patch("/:id/soft-delete", authenticate, requireAdmin, softDeleteOrder);
router.patch("/:id/restore", authenticate, requireAdmin, restoreOrder);
router.delete("/:id", authenticate, requireAdmin, hardDeleteOrder);

export default router;
