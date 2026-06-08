import express from "express";

import { protect } from "../middleware/authMiddleware.js";

import {
  saveBalance,
  getBalance,
  getMyBalanceHistory,
} from "../controllers/balanceController.js";

const router = express.Router();

// Create or update balance
router.post("/", protect, saveBalance);

// Get staff balance history
router.get("/my", protect, getMyBalanceHistory);

// Get opening balance
router.get("/", protect, getBalance);

export default router;
