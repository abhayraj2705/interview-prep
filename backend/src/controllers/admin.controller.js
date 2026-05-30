import mongoose from "mongoose";
import { AiPlan } from "../models/aiPlan.model.js";
import { AuditLog } from "../models/auditLog.model.js";
import { DailyReport } from "../models/dailyReport.model.js";
import { EmailLog } from "../models/emailLog.model.js";
import { Roadmap } from "../models/roadmap.model.js";
import { Task } from "../models/task.model.js";
import { User } from "../models/user.model.js";
import { WeeklyReport } from "../models/weeklyReport.model.js";
import { sendMorningReminder, sendNightReport, sendWeeklyReport } from "../services/mail.service.js";
import { logAdminAction } from "../services/audit.service.js";
import { successResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { startOfDay } from "../utils/date.js";

function pageOptions(query) {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(query.limit) || 20, 1), 100);
  return { page, limit, skip: (page - 1) * limit };
}

function pagination(page, limit, total) {
  return { page, limit, total, totalPages: Math.ceil(total / limit) };
}

function objectId(value) {
  return mongoose.Types.ObjectId.isValid(value) ? new mongoose.Types.ObjectId(value) : null;
}

function dateFilter(query, field = "createdAt") {
  const filter = {};
  if (query.dateFrom || query.dateTo) {
    filter[field] = {};
    if (query.dateFrom) filter[field].$gte = new Date(query.dateFrom);
    if (query.dateTo) filter[field].$lte = new Date(query.dateTo);
  }
  return filter;
}

export const adminSummary = asyncHandler(async (req, res) => {
  const today = startOfDay();
  const [
    totalUsers,
    activeUsers,
    newUsersToday,
    totalTasks,
    completedTasks,
    tasksToday,
    roadmaps,
    activeRoadmaps,
    aiGenerations,
    sentEmails,
    failedEmails,
    skippedEmails,
    reports,
    topCategories
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ status: "Active" }),
    User.countDocuments({ createdAt: { $gte: today } }),
    Task.countDocuments(),
    Task.countDocuments({ status: "Completed" }),
    Task.countDocuments({ dueDate: { $gte: today } }),
    Roadmap.countDocuments(),
    Roadmap.countDocuments({ status: "Active" }),
    AiPlan.countDocuments(),
    EmailLog.countDocuments({ status: "Sent" }),
    EmailLog.countDocuments({ status: "Failed" }),
    EmailLog.countDocuments({ status: "Skipped" }),
    DailyReport.find().sort({ date: -1 }).limit(30).lean(),
    Task.aggregate([
      { $group: { _id: "$category", total: { $sum: 1 }, completed: { $sum: { $cond: [{ $eq: ["$status", "Completed"] }, 1, 0] } } } },
      { $sort: { total: -1 } },
      { $limit: 6 }
    ])
  ]);

  const avgCompletionRate = reports.length
    ? Math.round(reports.reduce((sum, report) => sum + (report.completionRate || 0), 0) / reports.length)
    : 0;

  return successResponse(res, "Admin summary fetched", {
    users: { total: totalUsers, active: activeUsers, newToday: newUsersToday },
    tasks: { total: totalTasks, completed: completedTasks, dueToday: tasksToday },
    roadmaps: { total: roadmaps, active: activeRoadmaps },
    ai: { generations: aiGenerations },
    emails: { sent: sentEmails, failed: failedEmails, skipped: skippedEmails },
    reports: { avgCompletionRate },
    topCategories: topCategories.map((item) => ({
      category: item._id,
      total: item.total,
      completed: item.completed
    }))
  });
});

export const adminUsers = asyncHandler(async (req, res) => {
  const { page, limit, skip } = pageOptions(req.query);
  const filters = {};
  if (req.query.role) filters.role = req.query.role;
  if (req.query.status) filters.status = req.query.status;
  if (req.query.search) {
    filters.$or = [
      { name: { $regex: req.query.search, $options: "i" } },
      { email: { $regex: req.query.search, $options: "i" } },
      { targetRole: { $regex: req.query.search, $options: "i" } }
    ];
  }

  const [users, total] = await Promise.all([
    User.find(filters).select("-password").sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    User.countDocuments(filters)
  ]);
  return successResponse(res, "Admin users fetched", { users, pagination: pagination(page, limit, total) });
});

export const adminUserDetail = asyncHandler(async (req, res) => {
  const userId = objectId(req.params.id);
  if (!userId) {
    const error = new Error("Invalid user id");
    error.statusCode = 400;
    throw error;
  }

  const [user, taskStats, roadmaps, emails, aiPlans, dailyReports, weeklyReports] = await Promise.all([
    User.findById(userId).select("-password").lean(),
    Task.aggregate([
      { $match: { userId } },
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]),
    Roadmap.find({ userId }).select("title status timelineDays dailyStudyHours focusAreas createdAt updatedAt").sort({ createdAt: -1 }).limit(10).lean(),
    EmailLog.find({ userId }).sort({ createdAt: -1 }).limit(10).lean(),
    AiPlan.find({ userId }).select("type createdAt output.aiProvider").sort({ createdAt: -1 }).limit(10).lean(),
    DailyReport.find({ userId }).sort({ date: -1 }).limit(7).lean(),
    WeeklyReport.find({ userId }).sort({ weekStartDate: -1 }).limit(4).lean()
  ]);

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  return successResponse(res, "Admin user detail fetched", {
    user,
    taskStats,
    roadmaps,
    emails,
    aiPlans,
    dailyReports,
    weeklyReports
  });
});

export const adminUpdateUser = asyncHandler(async (req, res) => {
  const allowed = ["name", "targetRole", "dailyStudyHoursGoal", "role", "status", "emailPreferences"];
  const updates = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  }
  if (updates.role === "SuperAdmin" && req.user.role !== "SuperAdmin") {
    const error = new Error("Only super admins can assign SuperAdmin role");
    error.statusCode = 403;
    throw error;
  }
  const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true }).select("-password");
  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }
  await logAdminAction({ admin: req.user, action: "USER_UPDATED", entityType: "User", entityId: user._id, message: `Updated ${user.email}`, metadata: updates });
  return successResponse(res, "User updated", { user });
});

export const adminDeleteUser = asyncHandler(async (req, res) => {
  if (String(req.user._id) === String(req.params.id)) {
    const error = new Error("You cannot delete your own admin account");
    error.statusCode = 400;
    throw error;
  }
  const user = await User.findByIdAndDelete(req.params.id).select("-password");
  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }
  await logAdminAction({ admin: req.user, action: "USER_DELETED", entityType: "User", entityId: user._id, message: `Deleted ${user.email}` });
  return successResponse(res, "User deleted", { user });
});

export const adminTasks = asyncHandler(async (req, res) => {
  const { page, limit, skip } = pageOptions(req.query);
  const filters = { ...dateFilter(req.query, "dueDate") };
  if (req.query.userId) filters.userId = req.query.userId;
  if (req.query.status) filters.status = req.query.status;
  if (req.query.category) filters.category = req.query.category;
  if (req.query.priority) filters.priority = req.query.priority;
  if (req.query.source) filters["source.type"] = req.query.source;
  if (req.query.search) filters.title = { $regex: req.query.search, $options: "i" };
  const [tasks, total] = await Promise.all([
    Task.find(filters).populate("userId", "name email").sort({ dueDate: -1 }).skip(skip).limit(limit).lean(),
    Task.countDocuments(filters)
  ]);
  return successResponse(res, "Admin tasks fetched", { tasks, pagination: pagination(page, limit, total) });
});

export const adminRoadmaps = asyncHandler(async (req, res) => {
  const { page, limit, skip } = pageOptions(req.query);
  const filters = {};
  if (req.query.userId) filters.userId = req.query.userId;
  if (req.query.status) filters.status = req.query.status;
  if (req.query.search) filters.title = { $regex: req.query.search, $options: "i" };
  const [roadmaps, total] = await Promise.all([
    Roadmap.find(filters).populate("userId", "name email").select("-days").sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Roadmap.countDocuments(filters)
  ]);
  return successResponse(res, "Admin roadmaps fetched", { roadmaps, pagination: pagination(page, limit, total) });
});

export const adminRoadmapDetail = asyncHandler(async (req, res) => {
  const roadmap = await Roadmap.findById(req.params.id).populate("userId", "name email").lean();
  if (!roadmap) {
    const error = new Error("Roadmap not found");
    error.statusCode = 404;
    throw error;
  }
  return successResponse(res, "Admin roadmap fetched", { roadmap });
});

export const adminDeleteRoadmap = asyncHandler(async (req, res) => {
  const roadmap = await Roadmap.findByIdAndDelete(req.params.id);
  if (!roadmap) {
    const error = new Error("Roadmap not found");
    error.statusCode = 404;
    throw error;
  }
  await logAdminAction({ admin: req.user, action: "ROADMAP_DELETED", entityType: "Roadmap", entityId: roadmap._id, message: roadmap.title });
  return successResponse(res, "Roadmap deleted", { roadmap });
});

export const adminAiPlans = asyncHandler(async (req, res) => {
  const { page, limit, skip } = pageOptions(req.query);
  const filters = { ...dateFilter(req.query) };
  if (req.query.userId) filters.userId = req.query.userId;
  if (req.query.type) filters.type = req.query.type;
  const [aiPlans, total] = await Promise.all([
    AiPlan.find(filters).populate("userId", "name email").sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    AiPlan.countDocuments(filters)
  ]);
  return successResponse(res, "Admin AI plans fetched", { aiPlans, pagination: pagination(page, limit, total) });
});

export const adminEmails = asyncHandler(async (req, res) => {
  const { page, limit, skip } = pageOptions(req.query);
  const filters = { ...dateFilter(req.query) };
  if (req.query.userId) filters.userId = req.query.userId;
  if (req.query.status) filters.status = req.query.status;
  if (req.query.emailType) filters.emailType = req.query.emailType;
  const [emails, total] = await Promise.all([
    EmailLog.find(filters).populate("userId", "name email").sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    EmailLog.countDocuments(filters)
  ]);
  return successResponse(res, "Admin emails fetched", { emails, pagination: pagination(page, limit, total) });
});

export const adminRetryEmail = asyncHandler(async (req, res) => {
  const email = await EmailLog.findById(req.params.id).populate("userId");
  if (!email) {
    const error = new Error("Email log not found");
    error.statusCode = 404;
    throw error;
  }
  const senders = {
    "Morning Reminder": sendMorningReminder,
    "Night Report": sendNightReport,
    "Weekly Report": sendWeeklyReport
  };
  const sender = senders[email.emailType];
  if (!sender) {
    const error = new Error("This email type cannot be retried");
    error.statusCode = 400;
    throw error;
  }
  const result = await sender(email.userId);
  await logAdminAction({ admin: req.user, action: "EMAIL_RETRIED", entityType: "EmailLog", entityId: email._id, message: email.subject });
  return successResponse(res, "Email retry triggered", { result });
});

export const adminAuditLogs = asyncHandler(async (req, res) => {
  const { page, limit, skip } = pageOptions(req.query);
  const filters = { ...dateFilter(req.query) };
  if (req.query.action) filters.action = req.query.action;
  if (req.query.adminId) filters.adminId = req.query.adminId;
  const [logs, total] = await Promise.all([
    AuditLog.find(filters).populate("adminId", "name email").sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    AuditLog.countDocuments(filters)
  ]);
  return successResponse(res, "Admin audit logs fetched", { logs, pagination: pagination(page, limit, total) });
});

export const adminSystemHealth = asyncHandler(async (req, res) => {
  const dbState = mongoose.connection.readyState;
  return successResponse(res, "System health fetched", {
    mongo: { connected: dbState === 1, readyState: dbState },
    gemini: { configured: Boolean(process.env.GEMINI_API_KEY?.trim()), model: process.env.GEMINI_MODEL || "gemini-2.5-flash" },
    cloudinary: {
      configured: Boolean(
        process.env.CLOUDINARY_URL?.trim() ||
          (process.env.CLOUDINARY_CLOUD_NAME?.trim() && process.env.CLOUDINARY_API_KEY?.trim() && process.env.CLOUDINARY_API_SECRET?.trim())
      )
    },
    email: {
      configured: Boolean(process.env.EMAIL_HOST && process.env.EMAIL_PORT && process.env.EMAIL_USER && process.env.EMAIL_PASS),
      host: process.env.EMAIL_HOST || ""
    },
    cron: { timezone: process.env.CRON_TIMEZONE || "Asia/Kolkata" },
    environment: process.env.NODE_ENV || "development"
  });
});
