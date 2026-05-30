import dotenv from "dotenv";
dotenv.config();

import cors from "cors";
import express from "express";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";
import taskRoutes from "./routes/task.routes.js";
import rewardRoutes from "./routes/reward.routes.js";
import reportRoutes from "./routes/report.routes.js";
import aiRoutes from "./routes/ai.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import roadmapRoutes from "./routes/roadmap.routes.js";
import { errorHandler, notFound } from "./middleware/error.middleware.js";
import { successResponse } from "./utils/apiResponse.js";
import { registerJobs } from "./jobs/index.js";
import { syncMongoIndexes } from "./utils/syncIndexes.js";

const app = express();
const port = process.env.PORT || 5000;
const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174"
].filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error(`CORS blocked origin: ${origin}`));
    },
    credentials: true
  })
);
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (req, res) => successResponse(res, "Server is running"));
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/rewards", rewardRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/roadmaps", roadmapRoutes);

app.use(notFound);
app.use(errorHandler);

connectDB()
  .then(async () => {
    await syncMongoIndexes();
    app.listen(port, () => console.log(`Backend running on http://localhost:${port}`));
    registerJobs();
  })
  .catch((error) => {
    console.error("Database connection error", error);
    process.exit(1);
  });
