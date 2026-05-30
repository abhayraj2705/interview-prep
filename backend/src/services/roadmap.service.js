import { Roadmap } from "../models/roadmap.model.js";
import { Task } from "../models/task.model.js";
import { generateRoadmapData } from "./ai.service.js";
import { startOfDay } from "../utils/date.js";
import { invalidateDashboardCache } from "./dashboardCache.service.js";

function addDays(date, days) {
  const value = new Date(date);
  value.setDate(value.getDate() + days);
  return value;
}

function buildRoadmapTaskDescription(roadmap, day, item) {
  const parts = [
    `Roadmap: ${roadmap.title}`,
    `Day ${day.dayNumber}: ${day.theme}`,
    `Scheduled date: ${new Date(day.date).toLocaleDateString("en-IN")}`,
    "",
    "What to cover:",
    item.description || `Work through the planned ${item.category} topic and make short interview notes.`,
    "",
    "Why this matters:",
    item.reason || "This task was generated as part of your AI preparation roadmap.",
    "",
    "Completion checklist:",
    "- Study the concept and write 4-6 bullet notes.",
    "- Practice the listed problem/question type.",
    "- Mark doubts or mistakes for revision.",
    "- Add actual study time before completing the task."
  ];

  return parts.join("\n");
}

export async function createRoadmap(userId, payload) {
  const { output } = await generateRoadmapData(userId, payload);
  const startDate = payload.startDate ? new Date(payload.startDate) : new Date(output.days[0]?.date || Date.now());
  const endDate = addDays(startDate, (output.timelineDays || output.days.length || 1) - 1);

  return Roadmap.create({
    userId,
    title: payload.goalTitle || output.title,
    summary: output.summary,
    focusAreas: output.focusAreas,
    timelineDays: output.timelineDays,
    dailyStudyHours: output.dailyStudyHours,
    intensity: payload.intensity || "Balanced",
    startDate,
    endDate,
    status: "Draft",
    questionnaire: payload.questionnaire || [],
    days: output.days
  });
}

export async function convertRoadmapToTasks(userId, roadmapId, options = {}) {
  const roadmap = await Roadmap.findOne({ _id: roadmapId, userId });
  if (!roadmap) {
    const error = new Error("Roadmap not found");
    error.statusCode = 404;
    throw error;
  }

  const mode = options.mode || "all";
  const dayIds = options.dayIds || [];
  const limitDays = Number(options.limitDays) || 7;
  const todayStart = startOfDay();
  const days =
    mode === "selected"
      ? roadmap.days.filter((day) => dayIds.includes(String(day._id)))
      : mode === "next"
        ? roadmap.days.filter((day) => day.date >= todayStart).slice(0, limitDays)
        : roadmap.days;

  const createdTasks = [];
  let alreadyConvertedCount = 0;
  let repairedCount = 0;
  const convertedIds = days.flatMap((day) => day.tasks.map((item) => item.convertedTaskId).filter(Boolean));
  const existingConvertedIds = new Set(
    (await Task.find({ _id: { $in: convertedIds }, userId }).select("_id")).map((task) => String(task._id))
  );

  for (const day of days) {
    for (const item of day.tasks) {
      if (item.convertedTaskId && existingConvertedIds.has(String(item.convertedTaskId))) {
        alreadyConvertedCount += 1;
        continue;
      }
      if (item.convertedTaskId && !existingConvertedIds.has(String(item.convertedTaskId))) {
        item.convertedTaskId = undefined;
        repairedCount += 1;
      }
      const task = await Task.create({
        userId,
        title: item.title,
        description: buildRoadmapTaskDescription(roadmap, day, item),
        category: item.category,
        difficulty: item.difficulty,
        priority: item.priority,
        estimatedTimeMinutes: item.estimatedTimeMinutes,
        dueDate: day.date,
        status: "Pending",
        source: {
          type: "Roadmap",
          roadmapId: roadmap._id,
          roadmapDayId: day._id,
          roadmapTaskId: item._id,
          roadmapTitle: roadmap.title,
          roadmapDayNumber: day.dayNumber,
          roadmapTheme: day.theme
        }
      });
      item.convertedTaskId = task._id;
      createdTasks.push(task);
    }
  }

  await roadmap.save();
  if (createdTasks.length) {
    invalidateDashboardCache(userId);
  }
  return { roadmap, createdTasks, alreadyConvertedCount, repairedCount };
}

export async function activateRoadmap(userId, roadmapId) {
  await Roadmap.updateMany({ userId, status: "Active" }, { status: "Archived" });
  const roadmap = await Roadmap.findOneAndUpdate({ _id: roadmapId, userId }, { status: "Active" }, { new: true });
  if (!roadmap) {
    const error = new Error("Roadmap not found");
    error.statusCode = 404;
    throw error;
  }
  return roadmap;
}
