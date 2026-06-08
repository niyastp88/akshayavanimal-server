import express from "express";

import {
  createBalanceType,
  getBalanceTypes,
} from "../controllers/addBalanceController.js";

import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// Create balance type
router.post("/", protect, adminOnly, createBalanceType);

// Get balance types
router.get("/", protect, getBalanceTypes);

export default router;
