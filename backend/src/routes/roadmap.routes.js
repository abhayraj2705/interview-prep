import express from "express";
import {
  activate,
  convertToTasks,
  deleteRoadmaps,
  deleteRoadmap,
  generateRoadmap,
  getGenerateRoadmapJob,
  getRoadmap,
  getRoadmaps,
  startGenerateRoadmap,
  updateRoadmap
} from "../controllers/roadmap.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(protect);
router.route("/").get(getRoadmaps).delete(deleteRoadmaps);
router.post("/generate", generateRoadmap);
router.post("/generate-async", startGenerateRoadmap);
router.get("/generation-jobs/:jobId", getGenerateRoadmapJob);
router.route("/:id").get(getRoadmap).patch(updateRoadmap).delete(deleteRoadmap);
router.post("/:id/activate", activate);
router.post("/:id/convert-to-tasks", convertToTasks);

export default router;
