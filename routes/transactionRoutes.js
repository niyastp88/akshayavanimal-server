import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  createTransaction,
  getMyTransactions,
  getStaffReport,
  updateTransaction,
  deleteTransaction,
} from "../controllers/transactionController.js";

const router = express.Router();

router.post("/", protect, createTransaction);
router.get("/my", protect, getMyTransactions);
router.get("/staff-report", protect, getStaffReport);
router.put("/:id", protect, updateTransaction);
router.delete("/:id", protect, deleteTransaction);

export default router;