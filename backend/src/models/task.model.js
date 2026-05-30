import mongoose from "mongoose";

const categories = [
  "DSA",
  "MERN Stack",
  "JavaScript",
  "React",
  "Node.js",
  "MongoDB",
  "Core CS",
  "DBMS",
  "Operating System",
  "Computer Networks",
  "OOP",
  "System Design",
  "Cybersecurity",
  "Aptitude",
  "Resume",
  "HR Preparation",
  "Mock Interview",
  "Other"
];

const taskSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    category: { type: String, enum: categories, default: "Other" },
    difficulty: { type: String, enum: ["Easy", "Medium", "Hard"], default: "Medium" },
    priority: { type: String, enum: ["Low", "Medium", "High", "Critical"], default: "Medium" },
    estimatedTimeMinutes: { type: Number, default: 30, min: 0 },
    actualTimeMinutes: { type: Number, default: 0, min: 0 },
    dueDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Completed", "Skipped"],
      default: "Pending"
    },
    points: { type: Number, default: 0 },
    completedAt: { type: Date },
    source: {
      type: {
        type: String,
        enum: ["Manual", "Roadmap", "AI Suggestion"],
        default: "Manual"
      },
      roadmapId: { type: mongoose.Schema.Types.ObjectId, ref: "Roadmap" },
      roadmapDayId: { type: mongoose.Schema.Types.ObjectId },
      roadmapTaskId: { type: mongoose.Schema.Types.ObjectId },
      roadmapTitle: String,
      roadmapDayNumber: Number,
      roadmapTheme: String
    }
  },
  { timestamps: true }
);

taskSchema.index({ userId: 1, dueDate: 1, status: 1 });
taskSchema.index({ userId: 1, status: 1, completedAt: -1 });
taskSchema.index({ userId: 1, category: 1, status: 1 });
taskSchema.index({ userId: 1, priority: 1, status: 1 });
taskSchema.index({ userId: 1, "source.type": 1, "source.roadmapId": 1, dueDate: 1 });

export const TASK_CATEGORIES = categories;
export const Task = mongoose.model("Task", taskSchema);
