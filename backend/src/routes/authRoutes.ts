import { Router } from "express";
import { adminLogin, register, login, getMe } from "../controllers/authController.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

router.post("/admin/login", adminLogin);
router.post("/register", register);
router.post("/login", login);
router.get("/me", authenticate, getMe);

export default router;
