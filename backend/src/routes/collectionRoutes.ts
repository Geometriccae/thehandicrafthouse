import { Router } from "express";
import {
  getCollections,
  createCollection,
  updateCollection,
  deleteCollection,
} from "../controllers/collectionController.js";
import { authenticate, requireAdmin } from "../middleware/auth.js";

const router = Router();

router.get("/", getCollections);
router.post("/", authenticate, requireAdmin, createCollection);
router.put("/:id", authenticate, requireAdmin, updateCollection);
router.delete("/:id", authenticate, requireAdmin, deleteCollection);

export default router;
