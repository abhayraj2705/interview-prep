import cron from "node-cron";
import { User } from "../models/user.model.js";
import { recalculateStreakForUser } from "../services/reward.service.js";

export function scheduleStreakJob() {
  return cron.schedule(
    "30 23 * * *",
    async () => {
      const users = await User.find();
      for (const user of users) {
        await recalculateStreakForUser(user._id).catch((error) => console.error("Streak update failed", error.message));
      }
    },
    { timezone: process.env.CRON_TIMEZONE || "Asia/Kolkata" }
  );
}
