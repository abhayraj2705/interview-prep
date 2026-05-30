import cron from "node-cron";
import { User } from "../models/user.model.js";
import { sendNightReport } from "../services/mail.service.js";

export function scheduleNightReport() {
  return cron.schedule(
    "0 22 * * *",
    async () => {
      const users = await User.find({ "emailPreferences.nightReport": true });
      for (const user of users) {
        await sendNightReport(user).catch((error) => console.error("Night report failed", error.message));
      }
    },
    { timezone: process.env.CRON_TIMEZONE || "Asia/Kolkata" }
  );
}
