import { createTransporter } from "../config/mail.js";
import { EmailLog } from "../models/emailLog.model.js";
import { Task } from "../models/task.model.js";
import { endOfDay, startOfDay } from "../utils/date.js";
import { getOrCreateReward } from "./reward.service.js";
import { generateDailyReport, generateWeeklyReport } from "./report.service.js";

async function logEmail({ user, emailType, subject, status, errorMessage = "" }) {
  return EmailLog.create({
    userId: user._id,
    emailType,
    recipientEmail: user.email,
    subject,
    status,
    sentAt: status === "Sent" ? new Date() : undefined,
    errorMessage
  });
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function emailShell({ title, eyebrow, preheader, children }) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(title)}</title>
  </head>
  <body style="margin:0;padding:0;background:#050505;color:#f5f5f5;font-family:Inter,Segoe UI,Arial,sans-serif;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${escapeHtml(preheader)}</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#050505;background-image:linear-gradient(rgba(255,255,255,.045) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.045) 1px,transparent 1px);background-size:32px 32px;">
      <tr>
        <td align="center" style="padding:32px 14px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:680px;background:#111111;border:1px solid rgba(249,115,22,.35);border-radius:22px;overflow:hidden;box-shadow:0 24px 70px rgba(0,0,0,.55);">
            <tr>
              <td style="padding:30px 30px 22px;background:linear-gradient(135deg,rgba(199,91,18,.24),rgba(153,27,27,.18));border-bottom:1px solid rgba(249,115,22,.24);">
                <div style="font-size:12px;font-weight:800;letter-spacing:.4px;text-transform:uppercase;color:#f97316;margin-bottom:10px;">${escapeHtml(eyebrow)}</div>
                <h1 style="margin:0;color:#ffffff;font-size:30px;line-height:1.15;font-weight:800;">${escapeHtml(title)}</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:30px;">
                ${children}
              </td>
            </tr>
            <tr>
              <td style="padding:20px 30px;background:#0b0b0b;border-top:1px solid rgba(249,115,22,.18);">
                <p style="margin:0;color:#a3a3a3;font-size:13px;line-height:1.6;">Reward Todo keeps your placement preparation visible, measurable, and consistent.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function statBox(label, value, accent = "#f97316") {
  return `<td style="width:50%;padding:8px;">
    <div style="background:#181818;border:1px solid rgba(249,115,22,.24);border-radius:16px;padding:16px;">
      <div style="color:#a3a3a3;font-size:12px;font-weight:800;text-transform:uppercase;margin-bottom:8px;">${escapeHtml(label)}</div>
      <div style="color:${accent};font-size:26px;font-weight:800;line-height:1.1;">${escapeHtml(value)}</div>
    </div>
  </td>`;
}

function progressBar(value) {
  const width = Math.max(0, Math.min(Number(value) || 0, 100));
  return `<div style="height:12px;background:rgba(255,255,255,.09);border-radius:999px;overflow:hidden;margin:12px 0 4px;">
    <div style="height:12px;width:${width}%;background:linear-gradient(135deg,#f97316,#991b1b);border-radius:999px;"></div>
  </div>`;
}

function buildMorningHtml({ user, tasks, reward }) {
  const taskRows = tasks.length
    ? tasks
        .map(
          (task, index) => `<tr>
            <td style="padding:14px 0;border-bottom:1px solid rgba(255,255,255,.08);color:#f5f5f5;font-size:15px;line-height:1.5;">
              <strong style="color:#f97316;margin-right:8px;">${index + 1}.</strong>${escapeHtml(task.title)}
              <div style="margin-top:5px;color:#a3a3a3;font-size:13px;">${escapeHtml(task.category)} · ${escapeHtml(task.priority)} priority · ${escapeHtml(task.difficulty)}</div>
            </td>
          </tr>`
        )
        .join("")
    : `<tr><td style="padding:18px 0;color:#a3a3a3;line-height:1.6;">No tasks scheduled yet. Add a focused preparation plan for today.</td></tr>`;

  return emailShell({
    title: "Today's Interview Prep Tasks",
    eyebrow: "Morning preparation plan",
    preheader: "Your task list, target, streak, and XP for today.",
    children: `
      <p style="margin:0 0 18px;color:#f5f5f5;font-size:17px;line-height:1.7;">Good morning <strong>${escapeHtml(user.name)}</strong>,</p>
      <p style="margin:0 0 22px;color:#a3a3a3;font-size:15px;line-height:1.7;">Here is your focused interview preparation plan for today. Aim for at least <strong style="color:#f97316;">80% completion</strong>.</p>
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 22px;"><tr>
        ${statBox("Current Streak", `${reward.currentStreak} days`)}
        ${statBox("Total XP", `${reward.totalPoints} XP`, "#ffffff")}
      </tr></table>
      <div style="background:#0b0b0b;border:1px solid rgba(249,115,22,.24);border-radius:18px;padding:20px;margin-bottom:22px;">
        <h2 style="margin:0 0 8px;color:#ffffff;font-size:20px;">Today's Tasks</h2>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">${taskRows}</table>
      </div>
      <div style="background:rgba(249,115,22,.1);border:1px solid rgba(249,115,22,.28);border-radius:16px;padding:16px;color:#fed7aa;font-size:15px;line-height:1.7;">
        Stay consistent. Every completed task takes you closer to placement readiness.
      </div>`
  });
}

function buildNightHtml({ user, report, reward, suggestion }) {
  return emailShell({
    title: "Your Daily Interview Prep Report",
    eyebrow: "Night performance review",
    preheader: `Completed ${report.completedTasks}/${report.totalTasks} tasks with ${report.completionRate}% completion.`,
    children: `
      <p style="margin:0 0 18px;color:#f5f5f5;font-size:17px;line-height:1.7;">Hello <strong>${escapeHtml(user.name)}</strong>,</p>
      <p style="margin:0 0 20px;color:#a3a3a3;font-size:15px;line-height:1.7;">Here is your preparation report for today. Use this to decide tomorrow's first study block.</p>
      <div style="background:#0b0b0b;border:1px solid rgba(249,115,22,.24);border-radius:18px;padding:20px;margin-bottom:22px;">
        <div style="color:#a3a3a3;font-size:12px;font-weight:800;text-transform:uppercase;">Completion Rate</div>
        <div style="color:#ffffff;font-size:44px;font-weight:800;line-height:1;margin-top:8px;">${report.completionRate}%</div>
        ${progressBar(report.completionRate)}
        <div style="color:#a3a3a3;font-size:13px;margin-top:8px;">${report.completedTasks} of ${report.totalTasks} tasks completed</div>
      </div>
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 22px;">
        <tr>
          ${statBox("XP Earned", `${report.totalPointsEarned} XP`)}
          ${statBox("Current Streak", `${reward.currentStreak} days`, "#ffffff")}
        </tr>
        <tr>
          ${statBox("Study Time", `${report.totalStudyTimeMinutes} min`, "#ffffff")}
          ${statBox("Weak Area", report.weakestCategory || "N/A")}
        </tr>
      </table>
      <div style="background:#181818;border:1px solid rgba(255,255,255,.08);border-radius:18px;padding:18px;margin-bottom:18px;">
        <h2 style="margin:0 0 10px;color:#ffffff;font-size:20px;">Task Breakdown</h2>
        <p style="margin:0;color:#a3a3a3;font-size:15px;line-height:1.8;">
          Completed: <strong style="color:#ffffff;">${report.completedTasks}</strong><br>
          Pending: <strong style="color:#ffffff;">${report.pendingTasks}</strong><br>
          Skipped: <strong style="color:#ffffff;">${report.skippedTasks}</strong><br>
          Strongest Category: <strong style="color:#ffffff;">${escapeHtml(report.strongestCategory || "N/A")}</strong>
        </p>
      </div>
      <div style="background:rgba(249,115,22,.1);border:1px solid rgba(249,115,22,.28);border-radius:16px;padding:16px;color:#fed7aa;font-size:15px;line-height:1.7;">
        <strong style="color:#ffffff;">Tomorrow's suggested focus:</strong><br>
        ${escapeHtml(suggestion)}
      </div>`
  });
}

function buildWeeklyHtml({ user, report, reward }) {
  return emailShell({
    title: "Your Weekly Interview Prep Review",
    eyebrow: "Weekly progress review",
    preheader: `Weekly completion: ${report.completedTasks}/${report.totalTasks} tasks at ${report.completionRate}%.`,
    children: `
      <p style="margin:0 0 18px;color:#f5f5f5;font-size:17px;line-height:1.7;">Hi <strong>${escapeHtml(user.name)}</strong>,</p>
      <p style="margin:0 0 20px;color:#a3a3a3;font-size:15px;line-height:1.7;">Here is your weekly preparation review. Use it to decide what deserves your first focused block next week.</p>
      <div style="background:#0b0b0b;border:1px solid rgba(249,115,22,.24);border-radius:18px;padding:20px;margin-bottom:22px;">
        <div style="color:#a3a3a3;font-size:12px;font-weight:800;text-transform:uppercase;">Weekly Completion</div>
        <div style="color:#ffffff;font-size:44px;font-weight:800;line-height:1;margin-top:8px;">${report.completionRate}%</div>
        ${progressBar(report.completionRate)}
        <div style="color:#a3a3a3;font-size:13px;margin-top:8px;">${report.completedTasks} of ${report.totalTasks} tasks completed this week</div>
      </div>
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 22px;">
        <tr>
          ${statBox("Weekly XP", `${report.totalPointsEarned} XP`)}
          ${statBox("Current Streak", `${reward.currentStreak} days`, "#ffffff")}
        </tr>
        <tr>
          ${statBox("Best Day", report.bestDay || "N/A", "#ffffff")}
          ${statBox("Weak Area", report.weakestCategory || "N/A")}
        </tr>
      </table>
      <div style="background:rgba(249,115,22,.1);border:1px solid rgba(249,115,22,.28);border-radius:16px;padding:16px;color:#fed7aa;font-size:15px;line-height:1.7;">
        <strong style="color:#ffffff;">Next week focus:</strong><br>
        ${escapeHtml(report.improvementSuggestion || "Keep a balanced plan with DSA, project revision, and interview practice.")}
      </div>`
  });
}

async function sendMail(user, emailType, subject, { text, html }) {
  const transporter = createTransporter();
  if (!transporter) {
    await logEmail({ user, emailType, subject, status: "Skipped", errorMessage: "Email credentials are not configured" });
    return { skipped: true };
  }

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject,
      text,
      html
    });
    await logEmail({ user, emailType, subject, status: "Sent" });
    return { sent: true };
  } catch (error) {
    await logEmail({ user, emailType, subject, status: "Failed", errorMessage: error.message });
    throw error;
  }
}

export async function sendMorningReminder(user) {
  const tasks = await Task.find({
    userId: user._id,
    dueDate: { $gte: startOfDay(), $lte: endOfDay() },
    status: { $ne: "Completed" }
  }).sort({ priority: -1, createdAt: 1 });
  const reward = await getOrCreateReward(user._id);
  const taskList = tasks.length
    ? tasks.map((task, index) => `${index + 1}. ${task.title} (${task.priority}, ${task.category})`).join("\n")
    : "No tasks scheduled yet. Add a focused preparation plan for today.";

  const subject = "Today's Interview Prep Tasks";
  const text = `Good morning ${user.name},

Here are your tasks for today:

${taskList}

Today's target:
Complete at least 80% of your tasks.

Current streak: ${reward.currentStreak} days
Total XP: ${reward.totalPoints}

Stay consistent. Every task completed today improves your placement preparation.`;
  const html = buildMorningHtml({ user, tasks, reward });

  return sendMail(user, "Morning Reminder", subject, { text, html });
}

export async function sendNightReport(user) {
  const { report } = await generateDailyReport(user._id);
  const reward = await getOrCreateReward(user._id);
  const suggestion =
    report.weakestCategory && report.weakestCategory !== "N/A"
      ? `Practice ${report.weakestCategory} and revise one MERN topic.`
      : "Plan at least one DSA task, one core MERN task, and one aptitude/revision task.";

  const subject = "Your Daily Interview Prep Report";
  const text = `Hello ${user.name},

Here is your preparation report for today:

Tasks Completed: ${report.completedTasks} / ${report.totalTasks}
Completion Rate: ${report.completionRate}%
XP Earned Today: ${report.totalPointsEarned}
Current Streak: ${reward.currentStreak} days
Weakest Category: ${report.weakestCategory}

Tomorrow's Suggested Focus:
${suggestion}

Keep improving daily. Small progress every day compounds into placement readiness.`;
  const html = buildNightHtml({ user, report, reward, suggestion });

  return sendMail(user, "Night Report", subject, { text, html });
}

export async function sendWeeklyReport(user) {
  const { report } = await generateWeeklyReport(user._id);
  const reward = await getOrCreateReward(user._id);
  const subject = "Your Weekly Interview Prep Review";
  const text = `Hi ${user.name},

Here is your weekly preparation review:

Tasks Completed: ${report.completedTasks} / ${report.totalTasks}
Completion Rate: ${report.completionRate}%
XP Earned This Week: ${report.totalPointsEarned}
Current Streak: ${reward.currentStreak} days
Best Day: ${report.bestDay}
Weakest Category: ${report.weakestCategory}

Next Week Focus:
${report.improvementSuggestion}

Keep your plan realistic, finish the important blocks first, and protect consistency.`;
  const html = buildWeeklyHtml({ user, report, reward });

  return sendMail(user, "Weekly Report", subject, { text, html });
}
