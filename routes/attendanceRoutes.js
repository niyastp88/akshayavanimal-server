import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  staffCheckIn,
  staffCheckOut,
  getMyAttendance,
  getAllAttendance,
} from "../controllers/attendanceController.js";

const router = express.Router();

router.post("/check-in", protect, staffCheckIn);
router.post("/check-out", protect, staffCheckOut);
router.get("/my", protect, getMyAttendance);
router.get("/all", protect, getAllAttendance);

export default router;