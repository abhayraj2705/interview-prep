import { GoogleGenAI } from "@google/genai";
import { AiPlan } from "../models/aiPlan.model.js";
import { Roadmap } from "../models/roadmap.model.js";
import { Task } from "../models/task.model.js";
import { User } from "../models/user.model.js";
import { endOfDay, startOfDay } from "../utils/date.js";
import { parseJsonOutput } from "../utils/aiJsonParser.js";
import {
  buildDailySuggestionPrompt,
  buildQuestionnairePrompt,
  buildRoadmapPrompt,
  buildWeaknessPrompt,
  validCategories
} from "./aiPrompt.service.js";
import { getDashboardSummary } from "./report.service.js";

const defaultModel = process.env.GEMINI_MODEL || "gemini-2.5-flash";

function getClient() {
  if (!process.env.GEMINI_API_KEY) return null;
  return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
}

async function runJsonPrompt(prompt, fallback) {
  const client = getClient();
  if (!client) return fallback();

  const response = await client.models.generateContent({
    model: defaultModel,
    contents: prompt,
    config: {
      responseMimeType: "application/json"
    }
  });

  return parseJsonOutput(response.text);
}

function aiProviderName() {
  return process.env.GEMINI_API_KEY ? "Gemini" : "Fallback";
}

function addDays(date, days) {
  const value = new Date(date);
  value.setDate(value.getDate() + days);
  return value;
}

function isoDate(date) {
  return new Date(date).toISOString().slice(0, 10);
}

function categoryFromFocus(area) {
  if (area && typeof area === "object") {
    return categoryFromFocus(area.category || area.focusArea || area.title || area.name);
  }
  if (validCategories.includes(area)) return area;
  if (area === "OS") return "Operating System";
  if (area === "CN") return "Computer Networks";
  return "Other";
}

function textValue(value, fallback = "") {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) {
    return value.map((item) => textValue(item)).filter(Boolean).join(", ");
  }
  if (value && typeof value === "object") {
    return textValue(value.title || value.description || value.reason || value.name || value.value, fallback);
  }
  return fallback;
}

function numericValue(value, fallback) {
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value.replace(/[^\d.]/g, "")) || fallback;
  if (value && typeof value === "object") {
    return numericValue(value.estimatedTimeMinutes || value.minutes || value.duration, fallback);
  }
  return fallback;
}

function enumValue(value, allowed, fallback) {
  const normalized = textValue(value);
  return allowed.includes(normalized) ? normalized : fallback;
}

function expandFocusAreas(focusAreas = []) {
  const expanded = focusAreas.flatMap((area) =>
    area === "Core CS" ? ["DBMS", "Operating System", "Computer Networks", "OOP"] : area
  );
  return [...new Set(expanded.map(categoryFromFocus).filter((area) => area && area !== "Other"))];
}

function resolveFocusArea(focusAreas, index) {
  const expanded = expandFocusAreas(focusAreas);
  return expanded[index % expanded.length] || "DSA";
}

function conceptTitle(area) {
  const titles = {
    DSA: "Learn one DSA pattern and write template notes",
    DBMS: "Revise DBMS keys, normalization, and indexing",
    "Operating System": "Revise OS process, threads, scheduling, and deadlock",
    "Computer Networks": "Revise CN layers, TCP/UDP, HTTP, DNS, and routing",
    OOP: "Revise OOP pillars with JavaScript/Java examples",
    Aptitude: "Practice aptitude concept drills",
    "MERN Stack": "Revise one MERN project concept",
    React: "Revise React hooks and component patterns",
    "Node.js": "Revise Express middleware, auth, and error handling",
    MongoDB: "Revise MongoDB schema design and aggregation",
    Resume: "Improve resume bullets and project impact",
    "HR Preparation": "Practice HR answers with examples",
    "Mock Interview": "Run a timed mock interview drill"
  };
  return titles[area] || `Study ${area} core concept`;
}

function practiceTitle(area) {
  const titles = {
    DSA: "Solve 4 to 6 placement-level DSA problems",
    DBMS: "Answer 15 DBMS interview questions",
    "Operating System": "Answer 15 OS interview questions",
    "Computer Networks": "Answer 15 CN interview questions",
    OOP: "Prepare OOP examples and solve design-style questions",
    Aptitude: "Solve 25 aptitude questions",
    "MERN Stack": "Explain one MERN project feature end to end",
    React: "Build or revise one React mini pattern",
    "Node.js": "Implement or revise one backend API pattern",
    MongoDB: "Practice schema/query design questions",
    Resume: "Prepare a 90-second project pitch",
    "HR Preparation": "Record and improve 3 HR answers",
    "Mock Interview": "Complete one mock round and note mistakes"
  };
  return titles[area] || `Practice ${area} questions`;
}

function normalizeRoadmapRequest(payload, userContext = {}) {
  const focusAreas = Array.isArray(payload.focusAreas) && payload.focusAreas.length ? payload.focusAreas : ["DSA"];
  const allowedRoadmapCategories = expandFocusAreas(focusAreas);
  const timelineDays = Math.max(1, Math.min(Number(payload.timelineDays) || 30, 120));
  const dailyStudyHours = Math.max(1, Math.min(Number(payload.dailyStudyHours) || userContext.dailyStudyHoursGoal || 3, 12));
  const startDate = payload.startDate ? new Date(payload.startDate) : startOfDay();

  return {
    goalTitle: payload.goalTitle || `${focusAreas.join(" + ")} Placement Roadmap`,
    focusAreas,
    allowedRoadmapCategories: allowedRoadmapCategories.length ? allowedRoadmapCategories : ["DSA"],
    timelineDays,
    dailyStudyHours,
    intensity: ["Light", "Balanced", "Aggressive"].includes(payload.intensity) ? payload.intensity : "Balanced",
    targetRole: payload.targetRole || userContext.targetRole || "",
    startDate,
    questionnaire: Array.isArray(payload.questionnaire) ? payload.questionnaire : []
  };
}

export function sanitizeTask(task, index = 0, allowedCategories = null) {
  const safeTask = task && typeof task === "object" && !Array.isArray(task) ? task : {};
  const normalizedCategory = validCategories.includes(safeTask.category) ? safeTask.category : categoryFromFocus(safeTask.category);
  const forcedCategory = Boolean(allowedCategories?.length && !allowedCategories.includes(normalizedCategory));
  const category = forcedCategory ? allowedCategories[index % allowedCategories.length] : normalizedCategory;
  const difficulty = enumValue(safeTask.difficulty, ["Easy", "Medium", "Hard"], "Medium");
  const priority = enumValue(safeTask.priority, ["Low", "Medium", "High", "Critical"], "Medium");
  return {
    title: forcedCategory
      ? index % 2 === 0
        ? conceptTitle(category)
        : practiceTitle(category)
      : textValue(safeTask.title, `Preparation task ${index + 1}`),
    description: forcedCategory
      ? `Replaced an off-topic AI task with a ${category} task from your selected roadmap focus.`
      : textValue(safeTask.description),
    category,
    difficulty,
    priority,
    estimatedTimeMinutes: Math.max(15, Math.min(numericValue(safeTask.estimatedTimeMinutes, 45), 180)),
    reason: forcedCategory
      ? `Only ${allowedCategories.join(", ")} is allowed for this roadmap.`
      : textValue(safeTask.reason, "Recommended based on your preparation goal.")
  };
}

function fallbackTaskForArea(area, index, dailyStudyHours) {
  const firstTaskMinutes = Math.min(Math.max(Math.round((dailyStudyHours * 60) / 2), 35), 90);
  const secondTaskMinutes = Math.min(Math.max(dailyStudyHours * 60 - firstTaskMinutes, 25), 90);
  const templates = [
    {
      title: conceptTitle(area),
      description: `Build understanding and make short interview notes for ${area}.`,
      category: area,
      difficulty: index % 3 === 0 ? "Easy" : "Medium",
      priority: "High",
      estimatedTimeMinutes: firstTaskMinutes,
      reason: `This task directly matches your selected focus area: ${area}.`
    },
    {
      title: practiceTitle(area),
      description: `Practice questions and record mistakes for ${area}.`,
      category: area,
      difficulty: "Medium",
      priority: "High",
      estimatedTimeMinutes: secondTaskMinutes,
      reason: "Practice converts roadmap theory into interview readiness."
    }
  ];
  return templates;
}

function enforceDailyWorkload(tasks, dailyStudyHours, allowedCategories, dayIndex) {
  const targetMinutes = dailyStudyHours * 60;
  const sanitized = tasks.map((task, index) => sanitizeTask(task, index, allowedCategories));
  const selected = [];
  let total = 0;

  for (const task of sanitized) {
    if (selected.length < 2 || total + task.estimatedTimeMinutes <= targetMinutes + 10) {
      selected.push(task);
      total += task.estimatedTimeMinutes;
    }
    if (selected.length >= 5 || total >= targetMinutes) break;
  }

  if (!selected.length) {
    const area = allowedCategories[dayIndex % allowedCategories.length] || "DSA";
    return fallbackTaskForArea(area, dayIndex, dailyStudyHours).map((task, index) => sanitizeTask(task, index, allowedCategories));
  }

  if (total > targetMinutes + 15) {
    const scale = targetMinutes / total;
    return selected.map((task) => ({
      ...task,
      estimatedTimeMinutes: Math.max(20, Math.round(task.estimatedTimeMinutes * scale))
    }));
  }

  return selected;
}

function rankSuggestion(task, activeRoadmap) {
  if (!activeRoadmap) return 0;
  const roadmapTasks = activeRoadmap.currentRoadmapDay?.tasks || [];
  const titleMatch = roadmapTasks.some((item) => item.title.toLowerCase() === task.title.toLowerCase());
  if (titleMatch) return 100;
  const focusMatch = activeRoadmap.focusAreas.some((area) => {
    if (area === "Core CS") {
      return ["Core CS", "DBMS", "Operating System", "Computer Networks", "OOP"].includes(task.category);
    }
    return area === task.category;
  });
  return focusMatch ? 50 : 0;
}

function fitSuggestionsToDailyCapacity(suggestions, context) {
  const dailyHours = context.activeRoadmap?.dailyStudyHours || context.user?.dailyStudyHoursGoal || 3;
  const targetMinutes = Math.max(60, Number(dailyHours) * 60);
  const ranked = suggestions
    .map((task, index) => ({ task, index, rank: rankSuggestion(task, context.activeRoadmap) }))
    .sort((a, b) => b.rank - a.rank || a.index - b.index);

  const selected = [];
  let total = 0;
  for (const item of ranked) {
    if (selected.length < 3 || total + item.task.estimatedTimeMinutes <= targetMinutes + 20) {
      selected.push(item);
      total += item.task.estimatedTimeMinutes;
    }
    if (selected.length >= 7 || total >= targetMinutes) break;
  }

  return selected.sort((a, b) => a.index - b.index).map((item) => item.task);
}

export async function collectPreparationContext(userId) {
  const user = await User.findById(userId);
  const dashboard = await getDashboardSummary(userId);
  const activeRoadmap = await Roadmap.findOne({ userId, status: "Active" }).sort({ updatedAt: -1 });
  const pendingTasks = await Task.find({
    userId,
    status: { $in: ["Pending", "In Progress"] },
    dueDate: { $lte: endOfDay(addDays(new Date(), 7)) }
  })
    .sort({ dueDate: 1 })
    .limit(12);

  const today = startOfDay();
  const roadmapDay =
    activeRoadmap?.days.find((day) => startOfDay(day.date).getTime() === today.getTime()) ||
    activeRoadmap?.days.find((day) => day.date >= today && day.tasks.some((task) => !task.convertedTaskId)) ||
    activeRoadmap?.days.find((day) => day.date >= today);

  return {
    user: {
      name: user.name,
      targetRole: user.targetRole,
      dailyStudyHoursGoal: user.dailyStudyHoursGoal,
      placementTargetDate: user.placementTargetDate
    },
    todayReport: dashboard.today,
    weeklyReport: dashboard.weekly,
    reward: dashboard.reward,
    activeRoadmap: activeRoadmap
      ? {
          title: activeRoadmap.title,
          summary: activeRoadmap.summary,
          focusAreas: activeRoadmap.focusAreas,
          timelineDays: activeRoadmap.timelineDays,
          dailyStudyHours: activeRoadmap.dailyStudyHours,
          intensity: activeRoadmap.intensity,
          currentRoadmapDay: roadmapDay
            ? {
                dayNumber: roadmapDay.dayNumber,
                date: roadmapDay.date,
                theme: roadmapDay.theme,
                tasks: roadmapDay.tasks.map((task) => ({
                  title: task.title,
                  category: task.category,
                  difficulty: task.difficulty,
                  priority: task.priority,
                  estimatedTimeMinutes: task.estimatedTimeMinutes,
                  reason: task.reason,
                  converted: Boolean(task.convertedTaskId)
                }))
              }
            : null
        }
      : null,
    pendingTasks: pendingTasks.map((task) => ({
      title: task.title,
      category: task.category,
      priority: task.priority,
      difficulty: task.difficulty,
      dueDate: task.dueDate
    }))
  };
}

export async function generateDailySuggestions(userId) {
  const context = await collectPreparationContext(userId);
  const roadmapTasks = context.activeRoadmap?.currentRoadmapDay?.tasks || [];
  const roadmapFallbackSuggestions = roadmapTasks.length
    ? roadmapTasks.slice(0, 5).map((task) =>
        sanitizeTask({
          ...task,
          title: task.converted ? `Review roadmap task: ${task.title}` : task.title,
          reason: `Scheduled in active roadmap "${context.activeRoadmap.title}" for day ${context.activeRoadmap.currentRoadmapDay.dayNumber}.`
        })
      )
    : null;
  const fallback = () => ({
    suggestions:
      roadmapFallbackSuggestions ||
      [
        sanitizeTask({
          title: "Solve 5 DSA pattern problems",
          description: "Focus on arrays, two pointers, or hashing based on your current comfort.",
          category: "DSA",
          difficulty: "Medium",
          priority: "High",
          estimatedTimeMinutes: 75,
          reason: "DSA needs consistent daily practice for placements."
        }),
        sanitizeTask({
          title: "Practice 20 aptitude questions",
          description: "Cover percentages, ratios, averages, or time and work.",
          category: "Aptitude",
          difficulty: "Easy",
          priority: "Medium",
          estimatedTimeMinutes: 40,
          reason: "Aptitude improves with short repeated drills."
        }),
        sanitizeTask({
          title: "Revise one Core CS interview topic",
          description: "Pick DBMS, OS, CN, or OOP and make concise interview notes.",
          category: "Core CS",
          difficulty: "Medium",
          priority: "High",
          estimatedTimeMinutes: 50,
          reason: "Core CS questions are common in placement interviews."
        }),
        sanitizeTask({
          title: "Prepare one interview explanation",
          description: "Explain a project feature, tradeoff, bug, or database design decision out loud.",
          category: "HR Preparation",
          difficulty: "Easy",
          priority: "Medium",
          estimatedTimeMinutes: 25,
          reason: "Communication practice turns preparation into interview performance."
        })
      ]
  });

  const output = await runJsonPrompt(buildDailySuggestionPrompt(context), fallback);
  const rawSuggestions = Array.isArray(output.suggestions) ? output.suggestions : fallback().suggestions;
  output.suggestions = rawSuggestions.slice(0, 8).map((task, index) => sanitizeTask(task, index));
  output.suggestions = fitSuggestionsToDailyCapacity(output.suggestions, context);
  output.aiProvider = aiProviderName();
  await AiPlan.create({ userId, type: "DailySuggestion", inputSnapshot: context, output });
  return output;
}

export async function generateQuestionnaire(userId, payload) {
  const baseContext = await collectPreparationContext(userId);
  const request = normalizeRoadmapRequest(payload, baseContext.user);
  const context = { ...baseContext, goalSetup: request };
  const fallback = () => ({
    questions: [
      { id: "current_level", question: "What is your current level in the selected topics?", type: "single_choice", options: ["Beginner", "Intermediate", "Advanced"] },
      { id: "weakest_topics", question: "Which topics feel weakest right now?", type: "text", options: [] },
      { id: "company_type", question: "Which companies are you targeting?", type: "single_choice", options: ["Service-based", "Product-based", "Startups", "Mixed"] },
      { id: "weekly_mocks", question: "Do you want weekly mock interviews included?", type: "single_choice", options: ["Yes", "No"] },
      { id: "revision_style", question: "How often should revision days appear?", type: "single_choice", options: ["Every 3 days", "Weekly", "Before every mock"] }
    ]
  });

  const output = await runJsonPrompt(buildQuestionnairePrompt(request), fallback);
  output.aiProvider = aiProviderName();
  await AiPlan.create({ userId, type: "Questionnaire", inputSnapshot: context, output });
  return output;
}

export async function generateRoadmapData(userId, payload) {
  const baseContext = await collectPreparationContext(userId);
  const request = normalizeRoadmapRequest(payload, baseContext.user);
  const { activeRoadmap, ...contextWithoutActiveRoadmap } = baseContext;
  const context = {
    ...contextWithoutActiveRoadmap,
    roadmapRequest: {
      goalTitle: request.goalTitle,
      focusAreas: request.focusAreas,
      allowedRoadmapCategories: request.allowedRoadmapCategories,
      timelineDays: request.timelineDays,
      dailyStudyHours: request.dailyStudyHours,
      intensity: request.intensity,
      targetRole: request.targetRole,
      startDate: isoDate(request.startDate),
      questionnaire: request.questionnaire
    }
  };
  const { timelineDays, startDate, focusAreas, dailyStudyHours, allowedRoadmapCategories } = request;

  const fallback = () => ({
    title: `${timelineDays}-Day ${focusAreas.join(" + ")} Placement Roadmap`,
    summary: `A ${payload.intensity || "Balanced"} day-wise plan with practice, revision, and interview readiness tasks.`,
    timelineDays,
    dailyStudyHours,
    focusAreas,
    days: Array.from({ length: timelineDays }, (_, index) => {
      const area = resolveFocusArea(focusAreas, index);
      const date = addDays(startDate, index);
      const isRevision = (index + 1) % 7 === 0;
      return {
        dayNumber: index + 1,
        date: isoDate(date),
        theme: isRevision ? `${area} revision and mixed practice` : `${area} focused practice`,
        tasks: [
          sanitizeTask({
            title: isRevision ? `Revise this week's ${area} mistakes and notes` : conceptTitle(area),
            description: isRevision ? "Review wrong answers, notes, and recurring doubts." : `Build understanding and make short notes for ${area}.`,
            category: area,
            difficulty: isRevision ? "Easy" : "Medium",
            priority: "High",
            estimatedTimeMinutes: Math.min(dailyStudyHours * 30, 90),
            reason: isRevision ? "Weekly revision prevents forgetting." : `This matches your ${area} roadmap focus.`
          }),
          sanitizeTask({
            title: isRevision ? `Timed ${area} mixed practice` : practiceTitle(area),
            description: isRevision ? "Practice a timed mixed set and note weak subtopics." : "Apply the concept through questions or coding practice.",
            category: area,
            difficulty: "Medium",
            priority: isRevision ? "Medium" : "High",
            estimatedTimeMinutes: Math.min(dailyStudyHours * 30, 90),
            reason: "Practice converts theory into interview readiness."
          })
        ]
      };
    })
  });

  const output = await runJsonPrompt(buildRoadmapPrompt(context), fallback);
  output.title = output.title || request.goalTitle;
  output.summary =
    output.summary ||
    `A ${request.intensity} ${timelineDays}-day roadmap for ${focusAreas.join(", ")} based on your form details.`;
  output.timelineDays = timelineDays;
  output.dailyStudyHours = dailyStudyHours;
  output.focusAreas = focusAreas;
  const sourceDays = Array.from({ length: timelineDays }, (_, index) => output.days?.[index]).map((day, index) => {
    const area = resolveFocusArea(focusAreas, index);
    return (
      day || {
        dayNumber: index + 1,
        date: isoDate(addDays(startDate, index)),
        theme: `${area} focused practice`,
        tasks: fallbackTaskForArea(area, index, dailyStudyHours)
      }
    );
  });
  output.days = sourceDays.slice(0, timelineDays).map((day, index) => ({
    dayNumber: Number(day.dayNumber) || index + 1,
    date: day.date || isoDate(addDays(startDate, index)),
    theme: day.theme || `${resolveFocusArea(focusAreas, index)} focused practice`,
    tasks: enforceDailyWorkload(day.tasks || [], dailyStudyHours, allowedRoadmapCategories, index)
  }));
  output.aiProvider = aiProviderName();

  return { output, context };
}

export async function analyzeWeakness(userId) {
  const context = await collectPreparationContext(userId);
  const fallback = () => ({
    overallReadinessScore: Math.max(30, Math.min(context.weeklyReport?.completionRate || 50, 90)),
    categoryScores: [
      {
        category: context.todayReport?.weakestCategory || "DSA",
        score: 55,
        status: "Needs Focus",
        reason: "This category has the lowest recent completion rate."
      }
    ],
    recommendations: [
      "Start each day with the weakest category before easier tasks.",
      "Keep one revision block every 3 to 4 days.",
      "Do one mock explanation weekly to improve interview fluency."
    ]
  });

  const output = await runJsonPrompt(buildWeaknessPrompt(context), fallback);
  output.aiProvider = aiProviderName();
  await AiPlan.create({ userId, type: "WeaknessAnalysis", inputSnapshot: context, output });
  return output;
}
