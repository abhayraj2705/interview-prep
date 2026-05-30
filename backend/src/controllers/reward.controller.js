import { getBadgeDefinitions, getOrCreateReward } from "../services/reward.service.js";
import { successResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getRewards = asyncHandler(async (req, res) => {
  const reward = await getOrCreateReward(req.user._id);
  return successResponse(res, "Rewards fetched", { reward });
});

export const getBadges = asyncHandler(async (req, res) => {
  const reward = await getOrCreateReward(req.user._id);
  const unlocked = reward.badges;
  const locked = getBadgeDefinitions().filter((badge) => !unlocked.some((item) => item.name === badge.name));
  return successResponse(res, "Badges fetched", { unlocked, locked });
});

export const getStreak = asyncHandler(async (req, res) => {
  const reward = await getOrCreateReward(req.user._id);
  return successResponse(res, "Streak fetched", {
    currentStreak: reward.currentStreak,
    longestStreak: reward.longestStreak
  });
});
