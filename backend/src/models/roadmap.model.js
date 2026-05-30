import mongoose from "mongoose";

const roadmapTaskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: "" },
    category: { type: String, required: true },
    difficulty: { type: String, enum: ["Easy", "Medium", "Hard"], default: "Medium" },
    priority: { type: String, enum: ["Low", "Medium", "High", "Critical"], default: "Medium" },
    estimatedTimeMinutes: { type: Number, default: 45 },
    reason: { type: String, default: "" },
    convertedTaskId: { type: mongoose.Schema.Types.ObjectId, ref: "Task" }
  },
  { _id: true }
);

const roadmapDaySchema = new mongoose.Schema(
  {
    dayNumber: { type: Number, required: true },
    date: { type: Date, required: true },
    theme: { type: String, default: "" },
    tasks: { type: [roadmapTaskSchema], default: [] }
  },
  { _id: true }
);

const roadmapSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true },
    summary: { type: String, default: "" },
    focusAreas: { type: [String], default: [] },
    timelineDays: { type: Number, required: true },
    dailyStudyHours: { type: Number, required: true },
    intensity: { type: String, enum: ["Light", "Balanced", "Aggressive"], default: "Balanced" },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: { type: String, enum: ["Draft", "Active", "Completed", "Archived"], default: "Draft" },
    questionnaire: {
      type: [
        {
          questionId: String,
          question: String,
          answer: String
        }
      ],
      default: []
    },
    days: { type: [roadmapDaySchema], default: [] },
    generatedBy: { type: String, default: "AI" }
  },
  { timestamps: true }
);

roadmapSchema.index({ userId: 1, status: 1, updatedAt: -1 });
roadmapSchema.index({ userId: 1, createdAt: -1 });
roadmapSchema.index({ userId: 1, startDate: 1, endDate: 1 });

export const Roadmap = mongoose.model("Roadmap", roadmapSchema);
