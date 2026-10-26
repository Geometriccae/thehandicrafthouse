import { Router } from "express";
import {
  getPayments,
  createPayment,
  updatePaymentStatus,
} from "../controllers/paymentController.js";
import { authenticate, requireAdmin } from "../middleware/auth.js";

const router = Router();

router.get("/", authenticate, requireAdmin, getPayments);
router.post("/", createPayment);
router.patch("/:id/status", authenticate, requireAdmin, updatePaymentStatus);

export default router;
