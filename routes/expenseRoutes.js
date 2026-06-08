import express from "express";

import { protect, adminOnly } from "../middleware/authMiddleware.js";

import {
  createExpenseType,
  getExpenseTypes,
  updateExpenseType,
  deleteExpenseType,
  createExpenseTx,
  getMyExpenses,
  getAllExpenses,
  updateExpense,
  deleteExpense,
} from "../controllers/expenseController.js";

const router = express.Router();

// Expense Types

router.post("/", protect, adminOnly, createExpenseType);

router.get("/", protect, getExpenseTypes);

router.put("/type/:id", protect, adminOnly, updateExpenseType);

router.delete("/type/:id", protect, adminOnly, deleteExpenseType);

// Expense Transactions

router.post("/add", protect, createExpenseTx);

router.get("/my", protect, getMyExpenses);

router.get("/all", protect, getAllExpenses);

router.put("/:id", protect, updateExpense);

router.delete("/:id", protect, deleteExpense);

export default router;
