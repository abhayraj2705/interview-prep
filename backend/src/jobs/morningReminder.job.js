import cron from "node-cron";
import { User } from "../models/user.model.js";
import { sendMorningReminder } from "../services/mail.service.js";

export function scheduleMorningReminder() {
  return cron.schedule(
    "0 7 * * *",
    async () => {
      const users = await User.find({ "emailPreferences.morningReminder": true });
      for (const user of users) {
        await sendMorningReminder(user).catch((error) => console.error("Morning reminder failed", error.message));
      }
    },
    { timezone: process.env.CRON_TIMEZONE || "Asia/Kolkata" }
  );
}
