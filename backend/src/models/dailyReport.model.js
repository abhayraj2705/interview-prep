import mongoose from "mongoose";

const dailyReportSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    date: { type: Date, required: true },
    totalTasks: { type: Number, default: 0 },
    completedTasks: { type: Number, default: 0 },
    pendingTasks: { type: Number, default: 0 },
    skippedTasks: { type: Number, default: 0 },
    completionRate: { type: Number, default: 0 },
    totalPointsEarned: { type: Number, default: 0 },
    totalStudyTimeMinutes: { type: Number, default: 0 },
    strongestCategory: { type: String, default: "N/A" },
    weakestCategory: { type: String, default: "N/A" },
    generatedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

dailyReportSchema.index({ userId: 1, date: 1 }, { unique: true });

export const DailyReport = mongoose.model("DailyReport", dailyReportSchema);
