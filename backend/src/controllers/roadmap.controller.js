import { Roadmap } from "../models/roadmap.model.js";
import { activateRoadmap, convertRoadmapToTasks, createRoadmap } from "../services/roadmap.service.js";
import { successResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const generateRoadmap = asyncHandler(async (req, res) => {
  const roadmap = await createRoadmap(req.user._id, req.body);
  return successResponse(res, "AI roadmap generated", { roadmap }, 201);
});

export const getRoadmaps = asyncHandler(async (req, res) => {
  const roadmaps = await Roadmap.find({ userId: req.user._id })
    .select("title summary focusAreas timelineDays dailyStudyHours intensity startDate endDate status createdAt updatedAt days.dayNumber days.tasks.convertedTaskId")
    .sort({ createdAt: -1 })
    .lean();
  return successResponse(res, "Roadmaps fetched", { roadmaps });
});

export const getRoadmap = asyncHandler(async (req, res) => {
  const roadmap = await Roadmap.findOne({ _id: req.params.id, userId: req.user._id });
  if (!roadmap) {
    const error = new Error("Roadmap not found");
    error.statusCode = 404;
    throw error;
  }
  return successResponse(res, "Roadmap fetched", { roadmap });
});

export const updateRoadmap = asyncHandler(async (req, res) => {
  const roadmap = await Roadmap.findOneAndUpdate({ _id: req.params.id, userId: req.user._id }, req.body, {
    new: true,
    runValidators: true
  });
  if (!roadmap) {
    const error = new Error("Roadmap not found");
    error.statusCode = 404;
    throw error;
  }
  return successResponse(res, "Roadmap updated", { roadmap });
});

export const deleteRoadmap = asyncHandler(async (req, res) => {
  const roadmap = await Roadmap.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
  if (!roadmap) {
    const error = new Error("Roadmap not found");
    error.statusCode = 404;
    throw error;
  }
  return successResponse(res, "Roadmap deleted", { roadmap });
});

export const activate = asyncHandler(async (req, res) => {
  const roadmap = await activateRoadmap(req.user._id, req.params.id);
  return successResponse(res, "Roadmap activated", { roadmap });
});

export const convertToTasks = asyncHandler(async (req, res) => {
  const data = await convertRoadmapToTasks(req.user._id, req.params.id, req.body);
  return successResponse(res, "Roadmap converted to tasks", data);
});
