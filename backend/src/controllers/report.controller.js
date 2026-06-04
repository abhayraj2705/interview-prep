import { DailyReport } from "../models/dailyReport.model.js";
import { WeeklyReport } from "../models/weeklyReport.model.js";
import { getDashboardSummary, generateDailyReport, generateWeeklyReport } from "../services/report.service.js";
import { successResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getDailyReports = asyncHandler(async (req, res) => {
  const reports = await DailyReport.aggregate([
    { $match: { userId: req.user._id } },
    {
      $addFields: {
        reportDay: {
          $dateToString: {
            format: "%Y-%m-%d",
            date: "$date",
            timezone: "Asia/Kolkata"
          }
        }
      }
    },
    { $sort: { reportDay: -1, generatedAt: -1, updatedAt: -1 } },
    { $group: { _id: "$reportDay", report: { $first: "$$ROOT" } } },
    { $replaceRoot: { newRoot: "$report" } },
    { $sort: { date: -1, generatedAt: -1 } },
    { $limit: 30 },
    { $project: { reportDay: 0 } }
  ]);
  return successResponse(res, "Daily reports fetched", { reports });
});

export const getWeeklyReports = asyncHandler(async (req, res) => {
  const reports = await WeeklyReport.find({ userId: req.user._id }).sort({ weekStartDate: -1 }).limit(12);
  return successResponse(res, "Weekly reports fetched", { reports });
});

export const createDailyReport = asyncHandler(async (req, res) => {
  const data = await generateDailyReport(req.user._id, req.body.date ? new Date(req.body.date) : new Date());
  return successResponse(res, "Daily report generated", data);
});

export const createWeeklyReport = asyncHandler(async (req, res) => {
  const data = await generateWeeklyReport(req.user._id, req.body.date ? new Date(req.body.date) : new Date());
  return successResponse(res, "Weekly report generated", data);
});

export const dashboard = asyncHandler(async (req, res) => {
  const data = await getDashboardSummary(req.user._id);
  return successResponse(res, "Dashboard summary fetched", data);
});
