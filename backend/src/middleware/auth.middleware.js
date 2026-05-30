import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { errorResponse } from "../utils/apiResponse.js";

export async function protect(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return errorResponse(res, "Unauthorized access", 401);
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.id);

  if (!user) {
    return errorResponse(res, "User no longer exists", 401);
  }

  if (user.status === "Suspended") {
    return errorResponse(res, "Your account is suspended", 403);
  }

  req.user = user;
  next();
}

export function requireAdmin(req, res, next) {
  if (!["Admin", "SuperAdmin"].includes(req.user?.role)) {
    return errorResponse(res, "Admin access required", 403);
  }
  next();
}

export function requireSuperAdmin(req, res, next) {
  if (req.user?.role !== "SuperAdmin") {
    return errorResponse(res, "Super admin access required", 403);
  }
  next();
}
