import { AiPlan } from "../models/aiPlan.model.js";
import { DailyReport } from "../models/dailyReport.model.js";
import { EmailLog } from "../models/emailLog.model.js";
import { Reward } from "../models/reward.model.js";
import { Roadmap } from "../models/roadmap.model.js";
import { RoadmapGenerationJob } from "../models/roadmapGenerationJob.model.js";
import { Task } from "../models/task.model.js";
import { User } from "../models/user.model.js";
import { WeeklyReport } from "../models/weeklyReport.model.js";
import { AuditLog } from "../models/auditLog.model.js";

export async function syncMongoIndexes() {
  if (process.env.SYNC_INDEXES === "false") return;

  await Promise.all([
    User.syncIndexes(),
    Task.syncIndexes(),
    Reward.syncIndexes(),
    DailyReport.syncIndexes(),
    WeeklyReport.syncIndexes(),
    EmailLog.syncIndexes(),
    AuditLog.syncIndexes(),
    AiPlan.syncIndexes(),
    RoadmapGenerationJob.syncIndexes(),
    Roadmap.syncIndexes()
  ]);

  console.log("MongoDB indexes synced");
}
