import mongoose from "mongoose";

const roadmapGenerationJobSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    status: { type: String, enum: ["Queued", "Processing", "Completed", "Failed"], default: "Queued", index: true },
    payload: { type: Object, default: {} },
    roadmapId: { type: mongoose.Schema.Types.ObjectId, ref: "Roadmap" },
    errorMessage: { type: String, default: "" },
    startedAt: { type: Date },
    completedAt: { type: Date }
  },
  { timestamps: true }
);

roadmapGenerationJobSchema.index({ userId: 1, createdAt: -1 });

export const RoadmapGenerationJob = mongoose.model("RoadmapGenerationJob", roadmapGenerationJobSchema);
