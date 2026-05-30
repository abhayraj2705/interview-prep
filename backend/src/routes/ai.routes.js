import express from "express";
import { dailySuggestions, questionnaire, weakness } from "../controllers/ai.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(protect);
router.post("/daily-suggestions", dailySuggestions);
router.post("/questionnaire", questionnaire);
router.post("/analyze-weakness", weakness);

export default router;
