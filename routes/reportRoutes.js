import express from "express";
import { getFinancialReport } from "../controllers/reportController.js";

const router = express.Router();

// Route to get summarized report logs within a date range
router.get("/", getFinancialReport);

export default router;