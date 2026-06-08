import express from "express";
import { getProfitSummary } from "../controllers/profitController.js";

const router = express.Router();

// RESTful Endpoint for profit analytics summary
router.get("/summary", getProfitSummary);

export default router;