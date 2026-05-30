import mongoose from "mongoose";

const weeklyReportSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    weekStartDate: { type: Date, required: true },
    weekEndDate: { type: Date, required: true },
    totalTasks: { type: Number, default: 0 },
    completedTasks: { type: Number, default: 0 },
    completionRate: { type: Number, default: 0 },
    totalPointsEarned: { type: Number, default: 0 },
    bestDay: { type: String, default: "N/A" },
    weakestCategory: { type: String, default: "N/A" },
    improvementSuggestion: { type: String, default: "Stay consistent with daily preparation." }
  },
  { timestamps: true }
);

weeklyReportSchema.index({ userId: 1, weekStartDate: 1 }, { unique: true });

export const WeeklyReport = mongoose.model("WeeklyReport", weeklyReportSchema);
