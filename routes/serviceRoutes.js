import express from "express";

import { protect, adminOnly } from "../middleware/authMiddleware.js";

import {
  createService,
  getServices,
  updateService,
  deleteService,
} from "../controllers/serviceController.js";

const router = express.Router();

// Create service
router.post("/", protect, adminOnly, createService);

// Get services
router.get("/", protect, getServices);

// Update service
router.put("/:id", protect, adminOnly, updateService);

// Delete service
router.delete("/:id", protect, adminOnly, deleteService);

export default router;
