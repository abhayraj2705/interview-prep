import express from "express";
import {
  activate,
  convertToTasks,
  deleteRoadmap,
  generateRoadmap,
  getRoadmap,
  getRoadmaps,
  updateRoadmap
} from "../controllers/roadmap.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(protect);
router.route("/").get(getRoadmaps);
router.post("/generate", generateRoadmap);
router.route("/:id").get(getRoadmap).patch(updateRoadmap).delete(deleteRoadmap);
router.post("/:id/activate", activate);
router.post("/:id/convert-to-tasks", convertToTasks);

export default router;
