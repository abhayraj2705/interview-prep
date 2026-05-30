import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { Reward } from "../models/reward.model.js";

function signToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d"
  });
}

export async function registerUser(payload) {
  const existing = await User.findOne({ email: payload.email });
  if (existing) {
    const error = new Error("Email is already registered");
    error.statusCode = 409;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(payload.password, 12);
  const user = await User.create({ ...payload, password: hashedPassword });
  await Reward.create({ userId: user._id });

  const token = signToken(user._id);
  const safeUser = await User.findById(user._id);
  return { user: safeUser, token };
}

export async function loginUser(email, password) {
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    const error = new Error("Invalid login credentials");
    error.statusCode = 401;
    throw error;
  }

  const matches = await bcrypt.compare(password, user.password);
  if (!matches) {
    const error = new Error("Invalid login credentials");
    error.statusCode = 401;
    throw error;
  }

  if (user.status === "Suspended") {
    const error = new Error("Your account is suspended");
    error.statusCode = 403;
    throw error;
  }

  const token = signToken(user._id);
  user.password = undefined;
  return { user, token };
}
