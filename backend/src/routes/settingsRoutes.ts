import { Router } from "express";
import { getSettings, updateSettings } from "../controllers/settingsController.js";
import { authenticate, requireAdmin } from "../middleware/auth.js";

const router = Router();

router.get("/", getSettings);
router.put("/", authenticate, requireAdmin, updateSettings);

export default router;
