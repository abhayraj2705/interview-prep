import { successResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { loginUser, registerUser } from "../services/auth.service.js";
import { deleteCloudinaryAsset, isDataImage, uploadProfilePhoto } from "../services/cloudinary.service.js";

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    const error = new Error("Name, email, and password are required");
    error.statusCode = 400;
    throw error;
  }
  const data = await registerUser(req.body);
  return successResponse(res, "Registration successful", data, 201);
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    const error = new Error("Email and password are required");
    error.statusCode = 400;
    throw error;
  }
  const data = await loginUser(email, password);
  return successResponse(res, "Login successful", data);
});

export const me = asyncHandler(async (req, res) => {
  return successResponse(res, "Current user fetched", { user: req.user });
});

export const logout = asyncHandler(async (req, res) => {
  return successResponse(res, "Logout successful");
});

export const updateProfile = asyncHandler(async (req, res) => {
  const allowedFields = [
    "name",
    "targetRole",
    "preparationStartDate",
    "placementTargetDate",
    "dailyStudyHoursGoal",
    "emailPreferences",
    "profilePhoto"
  ];

  const updates = {};
  for (const field of allowedFields) {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  }

  const incomingPhoto = updates.profilePhoto;
  if (incomingPhoto && isDataImage(incomingPhoto) && incomingPhoto.length > 750000) {
    const error = new Error("Profile photo is too large. Use an image under 500 KB.");
    error.statusCode = 400;
    throw error;
  }

  if (incomingPhoto !== undefined) {
    if (!incomingPhoto) {
      updates.profilePhoto = "";
      updates.profilePhotoPublicId = "";
      await deleteCloudinaryAsset(req.user.profilePhotoPublicId);
    } else if (isDataImage(incomingPhoto)) {
      const uploaded = await uploadProfilePhoto(incomingPhoto, req.user._id);
      updates.profilePhoto = uploaded.url;
      updates.profilePhotoPublicId = uploaded.publicId;
      await deleteCloudinaryAsset(req.user.profilePhotoPublicId);
    } else {
      updates.profilePhoto = incomingPhoto;
    }
  }

  const user = await req.user.constructor.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true
  });

  return successResponse(res, "Profile updated", { user });
});
