require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Serve files (uploads folder)
app.use("/uploads", express.static("uploads"));

// Auth Routes
const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);

// Task Routes
const taskRoutes = require("./routes/task");
app.use("/api/tasks", taskRoutes);

// Submission Routes
const submissionRoutes = require("./routes/submissionRoutes");
app.use("/api/submissions", submissionRoutes);

// Quiz Routes
const quizRoutes = require("./routes/quiz");
app.use("/api/quizzes", quizRoutes);

// Leaderboard Routes
const leaderboardRoutes = require("./routes/leaderboard");
app.use("/api/leaderboard", leaderboardRoutes);

// Rewards Routes
const rewardRoutes = require("./routes/rewards");
app.use("/api/rewards", rewardRoutes);

// Challenge Routes
const challengeRoutes = require("./routes/challenges");
app.use("/api/challenges", challengeRoutes);

// Teacher Routes
const teacherRoutes = require("./routes/teacher");
app.use("/api/teacher", teacherRoutes);

// Mini Games Routes
const miniGameRoutes = require("./routes/miniGames");
app.use("/api/mini-games", miniGameRoutes);

// Adaptive difficulty engine
const adaptiveEngineRoutes = require("./routes/adaptiveEngine");
app.use("/api/adaptive-engine", adaptiveEngineRoutes);

// Eco-Impact & Sustainability
const ecoImpactRoutes = require("./routes/ecoImpact");
app.use("/api/eco-impact", ecoImpactRoutes);
const sustainabilityAnalyticsRoutes = require("./routes/sustainabilityAnalytics");
app.use("/api/analytics/sustainability", sustainabilityAnalyticsRoutes);
const recommendationsRoutes = require("./routes/recommendations");
app.use("/api/recommendations", recommendationsRoutes);
const greenCreditsRoutes = require("./routes/greenCredits");
app.use("/api/green-credits", greenCreditsRoutes);
const gamificationRoutes = require("./routes/gamification");
app.use("/api/gamification", gamificationRoutes);

// Health check
app.get("/", (req, res) => {
  res.json({ message: "Backend running...", status: "ok" });
});

// MongoDB connection
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/capstone_project";

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log("❌ Mongo Error:", err));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
