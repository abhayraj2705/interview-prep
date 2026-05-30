import cron from "node-cron";
import { User } from "../models/user.model.js";
import { sendWeeklyReport } from "../services/mail.service.js";

export function scheduleWeeklyReport() {
  return cron.schedule(
    "0 20 * * 0",
    async () => {
      const users = await User.find({ "emailPreferences.weeklyReport": true });
      for (const user of users) {
        await sendWeeklyReport(user).catch((error) => console.error("Weekly report failed", error.message));
      }
    },
    { timezone: process.env.CRON_TIMEZONE || "Asia/Kolkata" }
  );
}
