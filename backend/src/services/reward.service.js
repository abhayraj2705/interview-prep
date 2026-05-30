import { Reward } from "../models/reward.model.js";
import { Task } from "../models/task.model.js";
import { calculateTaskPoints } from "../utils/calculatePoints.js";
import { isSameDay, yesterday } from "../utils/date.js";

const levels = [
  { min: 0, name: "Level 1: Beginner Candidate" },
  { min: 500, name: "Level 2: Consistent Learner" },
  { min: 1500, name: "Level 3: Interview Grinder" },
  { min: 3000, name: "Level 4: Placement Warrior" },
  { min: 5000, name: "Level 5: Offer Ready" }
];

const badgeDefinitions = [
  { name: "First Task Completed", description: "Completed your first preparation task." },
  { name: "3-Day Streak", description: "Maintained preparation for 3 days." },
  { name: "7-Day Streak", description: "Maintained preparation for 7 days." },
  { name: "DSA Warrior", description: "Completed 10 DSA tasks." },
  { name: "MERN Master", description: "Completed 10 MERN or stack tasks." },
  { name: "Resume Ready", description: "Completed a resume preparation task." },
  { name: "Mock Interview Starter", description: "Completed a mock interview task." },
  { name: "100% Day Completed", description: "Completed every task due in a day." }
];

export function getBadgeDefinitions() {
  return badgeDefinitions;
}

function getLevel(totalPoints) {
  return levels.reduce((current, level) => (totalPoints >= level.min ? level.name : current), levels[0].name);
}

function addBadge(reward, name) {
  if (reward.badges.some((badge) => badge.name === name)) return;
  const definition = badgeDefinitions.find((badge) => badge.name === name);
  if (definition) {
    reward.badges.push({ ...definition, unlockedAt: new Date() });
  }
}

async function updateBadges(reward, task) {
  const completedCount = await Task.countDocuments({ userId: reward.userId, status: "Completed" });
  if (completedCount >= 1) addBadge(reward, "First Task Completed");
  if (reward.currentStreak >= 3) addBadge(reward, "3-Day Streak");
  if (reward.currentStreak >= 7) addBadge(reward, "7-Day Streak");
  if (task.category === "Resume") addBadge(reward, "Resume Ready");
  if (task.category === "Mock Interview") addBadge(reward, "Mock Interview Starter");

  const dsaCount = await Task.countDocuments({ userId: reward.userId, category: "DSA", status: "Completed" });
  if (dsaCount >= 10) addBadge(reward, "DSA Warrior");

  const mernCount = await Task.countDocuments({
    userId: reward.userId,
    category: { $in: ["MERN Stack", "JavaScript", "React", "Node.js", "MongoDB"] },
    status: "Completed"
  });
  if (mernCount >= 10) addBadge(reward, "MERN Master");
}

export async function getOrCreateReward(userId) {
  let reward = await Reward.findOne({ userId });
  if (!reward) {
    reward = await Reward.create({ userId });
  }
  return reward;
}

export async function applyTaskCompletionReward(task) {
  const reward = await getOrCreateReward(task.userId);
  const today = new Date();
  const previousCompletionDate = reward.lastTaskCompletionDate;
  const points = calculateTaskPoints(task);

  if (!task.points) {
    reward.totalPoints += points;
    task.points = points;
  }

  if (!previousCompletionDate || !isSameDay(previousCompletionDate, today)) {
    if (previousCompletionDate && isSameDay(previousCompletionDate, yesterday(today))) {
      reward.currentStreak += 1;
    } else {
      reward.currentStreak = 1;
    }
    reward.lastTaskCompletionDate = today;
  }

  reward.longestStreak = Math.max(reward.longestStreak, reward.currentStreak);
  reward.currentLevel = getLevel(reward.totalPoints);
  await updateBadges(reward, task);
  await reward.save();
  await task.save();

  return reward;
}

export async function recalculateStreakForUser(userId) {
  const reward = await getOrCreateReward(userId);
  const latestTask = await Task.findOne({ userId, status: "Completed", completedAt: { $exists: true } }).sort({
    completedAt: -1
  });

  if (!latestTask) {
    reward.currentStreak = 0;
    await reward.save();
    return reward;
  }

  const today = new Date();
  if (!isSameDay(latestTask.completedAt, today) && !isSameDay(latestTask.completedAt, yesterday(today))) {
    reward.currentStreak = 0;
  }

  await reward.save();
  return reward;
}
