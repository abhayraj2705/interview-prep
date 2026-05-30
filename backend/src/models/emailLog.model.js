import mongoose from "mongoose";

const emailLogSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    emailType: { type: String, required: true },
    recipientEmail: { type: String, required: true },
    subject: { type: String, required: true },
    status: { type: String, enum: ["Sent", "Failed", "Skipped"], required: true },
    sentAt: { type: Date },
    errorMessage: { type: String, default: "" }
  },
  { timestamps: true }
);

emailLogSchema.index({ userId: 1, createdAt: -1 });
emailLogSchema.index({ status: 1, emailType: 1, createdAt: -1 });

export const EmailLog = mongoose.model("EmailLog", emailLogSchema);
