import express from "express";

import { protect } from "../middleware/authMiddleware.js";

import {
  createBalanceTx,
  getMyBalanceTx,
  getAllBalanceTx,
  updateBalanceTx,
  deleteBalanceTx,
} from "../controllers/balanceTxController.js";

const router = express.Router();

// Create transaction
router.post("/", protect, createBalanceTx);

// Get logged in user transactions
router.get("/my", protect, getMyBalanceTx);

// Get all transactions
router.get("/all", protect, getAllBalanceTx);

// Update transaction
router.put("/:id", protect, updateBalanceTx);

// Delete transaction
router.delete("/:id", protect, deleteBalanceTx);

export default router;
