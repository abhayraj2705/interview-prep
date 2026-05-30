import { analyzeWeakness, generateDailySuggestions, generateQuestionnaire } from "../services/ai.service.js";
import { successResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const dailySuggestions = asyncHandler(async (req, res) => {
  const data = await generateDailySuggestions(req.user._id);
  return successResponse(res, "AI daily suggestions generated", data);
});

export const questionnaire = asyncHandler(async (req, res) => {
  const data = await generateQuestionnaire(req.user._id, req.body);
  return successResponse(res, "AI questionnaire generated", data);
});

export const weakness = asyncHandler(async (req, res) => {
  const data = await analyzeWeakness(req.user._id);
  return successResponse(res, "AI weakness analysis generated", data);
});
