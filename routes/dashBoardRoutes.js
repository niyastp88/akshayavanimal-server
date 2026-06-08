import express from "express";
import { getAdminDashboard, getStaffDashboard } from "../controllers/dashboardController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// User-defined comment: Route for admin dashboard metrics
router.get("/", getAdminDashboard);

// User-defined comment: Route for staff dashboard metrics (Requires auth token verification)
router.get("/staff", protect, getStaffDashboard);

export default router;