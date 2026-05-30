import express from "express";
import rateLimit from "express-rate-limit";
import { login, logout, me, register, updateProfile } from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 25,
  standardHeaders: true,
  legacyHeaders: false
});

router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);
router.get("/me", protect, me);
router.patch("/profile", protect, updateProfile);
router.post("/logout", protect, logout);

export default router;
