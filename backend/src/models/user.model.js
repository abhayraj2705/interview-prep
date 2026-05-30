import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    role: { type: String, enum: ["User", "Admin", "SuperAdmin"], default: "User", index: true },
    status: { type: String, enum: ["Active", "Suspended"], default: "Active", index: true },
    targetRole: { type: String, default: "Software Developer" },
    profilePhoto: { type: String, default: "" },
    profilePhotoPublicId: { type: String, default: "" },
    preparationStartDate: { type: Date, default: Date.now },
    placementTargetDate: { type: Date },
    dailyStudyHoursGoal: { type: Number, default: 3 },
    emailPreferences: {
      morningReminder: { type: Boolean, default: true },
      nightReport: { type: Boolean, default: true },
      weeklyReport: { type: Boolean, default: true }
    }
  },
  { timestamps: true }
);

userSchema.index({ role: 1, status: 1, createdAt: -1 });

export const User = mongoose.model("User", userSchema);
