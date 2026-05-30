import express from "express";
import { getBadges, getRewards, getStreak } from "../controllers/reward.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(protect);
router.get("/", getRewards);
router.get("/badges", getBadges);
router.get("/streak", getStreak);

export default router;
