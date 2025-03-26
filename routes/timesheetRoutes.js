import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  createTimesheet,
  getTimesheets,
  updateTimesheet,
  deleteTimesheet,
} from "../controllers/timesheetController.js";

const router = express.Router();

router.get("/", protect, getTimesheets);
router.post("/", protect, createTimesheet);
router.put("/:id", protect, updateTimesheet);
router.delete("/:id", protect, deleteTimesheet);

export default router;
