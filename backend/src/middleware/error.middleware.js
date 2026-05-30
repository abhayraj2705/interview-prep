import { errorResponse } from "../utils/apiResponse.js";

export function notFound(req, res) {
  return errorResponse(res, `Route not found: ${req.originalUrl}`, 404);
}

export function errorHandler(err, req, res, next) {
  console.error(err);

  if (err.name === "ValidationError") {
    const message = Object.values(err.errors).map((item) => item.message).join(", ");
    return errorResponse(res, message, 400);
  }

  if (err.code === 11000) {
    return errorResponse(res, "Duplicate value already exists", 409);
  }

  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    return errorResponse(res, "Invalid or expired token", 401);
  }

  return errorResponse(res, err.message || "Server error", err.statusCode || 500);
}
