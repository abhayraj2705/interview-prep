import express from "express";
import {
  adminAiPlans,
  adminAuditLogs,
  adminDeleteRoadmap,
  adminDeleteUser,
  adminEmails,
  adminRetryEmail,
  adminRoadmapDetail,
  adminRoadmaps,
  adminSummary,
  adminSystemHealth,
  adminTasks,
  adminUpdateUser,
  adminUserDetail,
  adminUsers
} from "../controllers/admin.controller.js";
import { protect, requireAdmin, requireSuperAdmin } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(protect, requireAdmin);

router.get("/summary", adminSummary);
router.get("/system-health", adminSystemHealth);

router.get("/users", adminUsers);
router.get("/users/:id", adminUserDetail);
router.patch("/users/:id", adminUpdateUser);
router.delete("/users/:id", requireSuperAdmin, adminDeleteUser);

router.get("/tasks", adminTasks);

router.get("/roadmaps", adminRoadmaps);
router.get("/roadmaps/:id", adminRoadmapDetail);
router.delete("/roadmaps/:id", adminDeleteRoadmap);

router.get("/ai-plans", adminAiPlans);

router.get("/emails", adminEmails);
router.post("/emails/:id/retry", adminRetryEmail);

router.get("/audit-logs", adminAuditLogs);

export default router;
