import express from "express";
import {
  completeTask,
  createTask,
  deleteTask,
  getTaskById,
  getTasks,
  getTodayTasks,
  updateTask,
  updateTaskStatus
} from "../controllers/task.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(protect);
router.route("/").post(createTask).get(getTasks);
router.get("/today", getTodayTasks);
router.route("/:id").get(getTaskById).put(updateTask).delete(deleteTask);
router.patch("/:id/complete", completeTask);
router.patch("/:id/status", updateTaskStatus);

export default router;
