import { Router } from "express";
import { getDashboardStats } from "../controllers/dashboardController.js";
import { authenticate, requireAdmin } from "../middleware/auth.js";

const router = Router();

router.get("/stats", authenticate, requireAdmin, getDashboardStats);
router.get("/", authenticate, requireAdmin, getDashboardStats);

export default router;
