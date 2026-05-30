import { scheduleMorningReminder } from "./morningReminder.job.js";
import { scheduleNightReport } from "./nightReport.job.js";
import { scheduleStreakJob } from "./streak.job.js";
import { scheduleWeeklyReport } from "./weeklyReport.job.js";

export function registerJobs() {
  scheduleMorningReminder();
  scheduleNightReport();
  scheduleWeeklyReport();
  scheduleStreakJob();
  console.log("Cron jobs registered");
}
