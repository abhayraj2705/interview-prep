import express from "express";
import {
  completeTask,
  createTask,
  deleteTasks,
  deleteTask,
  getTaskById,
  getTasks,
  getTodayTasks,
  sendTodayTaskReminder,
  updateTask,
  updateTaskStatus
} from "../controllers/task.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(protect);
router.route("/").post(createTask).get(getTasks).delete(deleteTasks);
router.get("/today", getTodayTasks);
router.post("/today/reminder-email", sendTodayTaskReminder);
router.route("/:id").get(getTaskById).put(updateTask).delete(deleteTask);
router.patch("/:id/complete", completeTask);
router.patch("/:id/status", updateTaskStatus);

export default router;
