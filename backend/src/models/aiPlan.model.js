import mongoose from "mongoose";

const aiPlanSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: {
      type: String,
      enum: ["DailySuggestion", "Questionnaire", "WeaknessAnalysis", "Replan"],
      required: true
    },
    inputSnapshot: { type: Object, default: {} },
    output: { type: Object, default: {} }
  },
  { timestamps: true }
);

aiPlanSchema.index({ userId: 1, createdAt: -1 });
aiPlanSchema.index({ type: 1, createdAt: -1 });

export const AiPlan = mongoose.model("AiPlan", aiPlanSchema);
