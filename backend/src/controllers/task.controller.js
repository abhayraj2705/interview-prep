import { Task } from "../models/task.model.js";
import { applyTaskCompletionReward } from "../services/reward.service.js";
import { successResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { endOfDay, startOfDay } from "../utils/date.js";
import { invalidateDashboardCache } from "../services/dashboardCache.service.js";

function buildFilters(query, userId) {
  const filters = { userId };
  if (query.category) filters.category = query.category;
  if (query.status) filters.status = query.status;
  if (query.priority) filters.priority = query.priority;
  if (query.source) filters["source.type"] = query.source;
  if (query.roadmapId) filters["source.roadmapId"] = query.roadmapId;
  return filters;
}

export const createTask = asyncHandler(async (req, res) => {
  if (!req.body.title?.trim()) {
    const error = new Error("Task title is required");
    error.statusCode = 400;
    throw error;
  }
  if (!req.body.dueDate || Number.isNaN(new Date(req.body.dueDate).getTime())) {
    const error = new Error("Valid due date is required");
    error.statusCode = 400;
    throw error;
  }

  const task = await Task.create({ ...req.body, userId: req.user._id });
  invalidateDashboardCache(req.user._id);
  return successResponse(res, "Task created", { task }, 201);
});

export const getTasks = asyncHandler(async (req, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 100);
  const skip = (page - 1) * limit;
  const filters = buildFilters(req.query, req.user._id);
  const [tasks, total] = await Promise.all([
    Task.find(filters).sort({ dueDate: 1, createdAt: -1 }).skip(skip).limit(limit).lean(),
    Task.countDocuments(filters)
  ]);
  return successResponse(res, "Tasks fetched", {
    tasks,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  });
});

export const getTodayTasks = asyncHandler(async (req, res) => {
  const tasks = await Task.find({
    ...buildFilters(req.query, req.user._id),
    dueDate: { $gte: startOfDay(), $lte: endOfDay() }
  })
    .sort({ priority: -1, createdAt: -1 })
    .limit(25)
    .lean();
  return successResponse(res, "Today's tasks fetched", { tasks });
});

export const getTaskById = asyncHandler(async (req, res) => {
  const task = await Task.findOne({ _id: req.params.id, userId: req.user._id });
  if (!task) {
    const error = new Error("Task not found");
    error.statusCode = 404;
    throw error;
  }
  return successResponse(res, "Task fetched", { task });
});

export const updateTask = asyncHandler(async (req, res) => {
  const task = await Task.findOneAndUpdate({ _id: req.params.id, userId: req.user._id }, req.body, {
    new: true,
    runValidators: true
  });
  if (!task) {
    const error = new Error("Task not found");
    error.statusCode = 404;
    throw error;
  }
  invalidateDashboardCache(req.user._id);
  return successResponse(res, "Task updated", { task });
});

export const completeTask = asyncHandler(async (req, res) => {
  const task = await Task.findOne({ _id: req.params.id, userId: req.user._id });
  if (!task) {
    const error = new Error("Task not found");
    error.statusCode = 404;
    throw error;
  }

  task.status = "Completed";
  task.completedAt = new Date();
  if (req.body.actualTimeMinutes !== undefined) {
    task.actualTimeMinutes = req.body.actualTimeMinutes;
  }
  const reward = await applyTaskCompletionReward(task);
  invalidateDashboardCache(req.user._id);
  return successResponse(res, "Task completed", { task, reward });
});

export const updateTaskStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!["Pending", "In Progress", "Completed", "Skipped"].includes(status)) {
    const error = new Error("Invalid task status");
    error.statusCode = 400;
    throw error;
  }

  const task = await Task.findOne({ _id: req.params.id, userId: req.user._id });
  if (!task) {
    const error = new Error("Task not found");
    error.statusCode = 404;
    throw error;
  }

  if (status === "Completed") {
    task.status = status;
    task.completedAt = new Date();
    const reward = await applyTaskCompletionReward(task);
    invalidateDashboardCache(req.user._id);
    return successResponse(res, "Task status updated", { task, reward });
  }

  task.status = status;
  task.completedAt = undefined;
  await task.save();
  invalidateDashboardCache(req.user._id);
  return successResponse(res, "Task status updated", { task });
});

export const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
  if (!task) {
    const error = new Error("Task not found");
    error.statusCode = 404;
    throw error;
  }
  invalidateDashboardCache(req.user._id);
  return successResponse(res, "Task deleted", { task });
});
