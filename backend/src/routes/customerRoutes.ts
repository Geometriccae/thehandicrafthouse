import { Router } from "express";
import {
  getCustomers,
  getCustomerById,
  upsertCustomer,
  deleteCustomer,
  syncCart,
  syncWishlist,
} from "../controllers/customerController.js";
import { authenticate, requireAdmin } from "../middleware/auth.js";

const router = Router();

// Cart and Wishlist sync (authenticated users)
router.post("/cart", authenticate, syncCart);
router.post("/wishlist", authenticate, syncWishlist);

// Admin customer management
router.get("/", authenticate, requireAdmin, getCustomers);
router.get("/:id", authenticate, requireAdmin, getCustomerById);
router.post("/", authenticate, requireAdmin, upsertCustomer);
router.delete("/:id", authenticate, requireAdmin, deleteCustomer);

export default router;
