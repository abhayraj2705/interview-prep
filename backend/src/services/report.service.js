import { DailyReport } from "../models/dailyReport.model.js";
import { WeeklyReport } from "../models/weeklyReport.model.js";
import { Task } from "../models/task.model.js";
import { calculateDailyBonus } from "../utils/calculatePoints.js";
import { endOfDay, endOfWeek, startOfDay, startOfWeek } from "../utils/date.js";
import { getOrCreateReward, getBadgeDefinitions } from "./reward.service.js";
import { getCachedDashboard, setCachedDashboard } from "./dashboardCache.service.js";

function categoryStats(tasks) {
  const stats = {};
  for (const task of tasks) {
    if (!stats[task.category]) stats[task.category] = { total: 0, completed: 0 };
    stats[task.category].total += 1;
    if (task.status === "Completed") stats[task.category].completed += 1;
  }

  const entries = Object.entries(stats).map(([category, value]) => ({
    category,
    rate: value.total ? (value.completed / value.total) * 100 : 0
  }));

  if (!entries.length) {
    return { strongestCategory: "N/A", weakestCategory: "N/A", categoryBreakdown: [] };
  }

  entries.sort((a, b) => b.rate - a.rate);
  return {
    strongestCategory: entries[0].category,
    weakestCategory: entries[entries.length - 1].category,
    categoryBreakdown: entries
  };
}

export async function generateDailyReport(userId, date = new Date()) {
  const start = startOfDay(date);
  const end = endOfDay(date);
  const tasks = await Task.find({ userId, dueDate: { $gte: start, $lte: end } })
    .select("category status points actualTimeMinutes dueDate")
    .lean();
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((task) => task.status === "Completed").length;
  const skippedTasks = tasks.filter((task) => task.status === "Skipped").length;
  const pendingTasks = tasks.filter((task) => ["Pending", "In Progress"].includes(task.status)).length;
  const completionRate = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const totalPointsEarned = tasks.reduce((sum, task) => sum + (task.status === "Completed" ? task.points : 0), 0);
  const totalStudyTimeMinutes = tasks.reduce(
    (sum, task) => sum + (task.status === "Completed" ? task.actualTimeMinutes || 0 : 0),
    0
  );
  const { strongestCategory, weakestCategory, categoryBreakdown } = categoryStats(tasks);

  const report = await DailyReport.findOneAndUpdate(
    { userId, date: start },
    {
      userId,
      date: start,
      totalTasks,
      completedTasks,
      pendingTasks,
      skippedTasks,
      completionRate,
      totalPointsEarned,
      totalStudyTimeMinutes,
      strongestCategory,
      weakestCategory,
      generatedAt: new Date()
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  const reward = await getOrCreateReward(userId);
  const bonus = calculateDailyBonus(completionRate);
  if (bonus && !reward.badges.some((badge) => badge.name === "100% Day Completed") && completionRate === 100) {
    const badge = getBadgeDefinitions().find((item) => item.name === "100% Day Completed");
    reward.badges.push({ ...badge, unlockedAt: new Date() });
    await reward.save();
  }

  return { report, categoryBreakdown };
}

export async function generateWeeklyReport(userId, date = new Date()) {
  const weekStartDate = startOfWeek(date);
  const weekEndDate = endOfWeek(date);
  const tasks = await Task.find({ userId, dueDate: { $gte: weekStartDate, $lte: weekEndDate } })
    .select("category status points dueDate")
    .lean();
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((task) => task.status === "Completed").length;
  const completionRate = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const totalPointsEarned = tasks.reduce((sum, task) => sum + (task.status === "Completed" ? task.points : 0), 0);
  const { weakestCategory, categoryBreakdown } = categoryStats(tasks);

  const byDay = {};
  for (const task of tasks) {
    const key = task.dueDate.toLocaleDateString("en-US", { weekday: "long" });
    if (!byDay[key]) byDay[key] = { total: 0, completed: 0 };
    byDay[key].total += 1;
    if (task.status === "Completed") byDay[key].completed += 1;
  }

  const bestDay =
    Object.entries(byDay)
      .map(([day, value]) => ({ day, rate: value.total ? value.completed / value.total : 0 }))
      .sort((a, b) => b.rate - a.rate)[0]?.day || "N/A";

  const improvementSuggestion =
    weakestCategory && weakestCategory !== "N/A"
      ? `Focus on ${weakestCategory} tasks first tomorrow and keep at least one short revision block.`
      : "Add a balanced set of tasks across DSA, MERN, aptitude, and interview practice.";

  const report = await WeeklyReport.findOneAndUpdate(
    { userId, weekStartDate },
    {
      userId,
      weekStartDate,
      weekEndDate,
      totalTasks,
      completedTasks,
      completionRate,
      totalPointsEarned,
      bestDay,
      weakestCategory,
      improvementSuggestion
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  return { report, categoryBreakdown };
}

export async function getDashboardSummary(userId) {
  const cached = getCachedDashboard(userId);
  if (cached) return cached;

  const start = startOfDay();
  const end = endOfDay();
  const weekStart = startOfWeek();
  const [cachedToday, cachedWeekly, reward, todayTasks] = await Promise.all([
    DailyReport.findOne({ userId, date: start }).lean(),
    WeeklyReport.findOne({ userId, weekStartDate: weekStart }).lean(),
    getOrCreateReward(userId),
    Task.find({ userId, dueDate: { $gte: start, $lte: end } })
      .select("title category priority difficulty status dueDate estimatedTimeMinutes actualTimeMinutes points")
      .sort({ priority: 1, createdAt: -1 })
      .limit(10)
      .lean()
  ]);

  const [today, weekly] = await Promise.all([
    cachedToday ? { report: cachedToday, categoryBreakdown: [] } : generateDailyReport(userId),
    cachedWeekly ? { report: cachedWeekly, categoryBreakdown: [] } : generateWeeklyReport(userId)
  ]);

  const data = {
    today: today.report,
    weekly: weekly.report,
    categoryBreakdown: today.categoryBreakdown,
    reward,
    todayTasks
  };

  setCachedDashboard(userId, data);
  return data;
}
