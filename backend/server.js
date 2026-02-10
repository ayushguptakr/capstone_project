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
