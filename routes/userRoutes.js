import express from "express";
import { createStaff, getStaffUsers, updateStaff, deleteStaff } from "../controllers/userController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, adminOnly, createStaff);
router.get("/", protect, adminOnly, getStaffUsers);
router.put("/:id", protect, adminOnly, updateStaff);     // പുതിയത്
router.delete("/:id", protect, adminOnly, deleteStaff);  // പുതിയത്

export default router;