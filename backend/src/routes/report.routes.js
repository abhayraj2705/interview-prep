import express from "express";
import {
  createDailyReport,
  createWeeklyReport,
  dashboard,
  getDailyReports,
  getWeeklyReports
} from "../controllers/report.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(protect);
router.get("/dashboard", dashboard);
router.get("/daily", getDailyReports);
router.get("/weekly", getWeeklyReports);
router.post("/generate-daily", createDailyReport);
router.post("/generate-weekly", createWeeklyReport);

export default router;
