import mongoose from "mongoose";

const badgeSchema = new mongoose.Schema(
  {
    name: String,
    description: String,
    unlockedAt: { type: Date, default: Date.now }
  },
  { _id: false }
);

const rewardSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    totalPoints: { type: Number, default: 0 },
    currentLevel: { type: String, default: "Level 1: Beginner Candidate" },
    badges: { type: [badgeSchema], default: [] },
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    lastTaskCompletionDate: { type: Date }
  },
  { timestamps: true }
);

rewardSchema.index({ userId: 1, lastTaskCompletionDate: -1 });

export const Reward = mongoose.model("Reward", rewardSchema);
