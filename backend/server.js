require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const crypto = require("crypto");
const { ensureMiniGamesSeeded } = require("./services/miniGameBootstrapService");

const app = express();
app.disable("x-powered-by");
const observability = {
  startedAt: new Date().toISOString(),
  requestsTotal: 0,
  errorsTotal: 0,
  requestsByStatus: {},
  requestsByRoute: {},
};

// Middlewares
const corsOrigins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      // allow non-browser clients / same-origin
      if (!origin) return cb(null, true);
      if (corsOrigins.length === 0) return cb(null, true); // dev default
      return cb(null, corsOrigins.includes(origin));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

// Basic security headers (lightweight alternative to helmet for now)
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "geolocation=(), microphone=(), camera=()");
  next();
});

// Request tracing and lightweight logging
app.use((req, res, next) => {
  const requestId = req.headers["x-request-id"] || crypto.randomUUID();
  const startedAt = Date.now();
  req.requestId = requestId;
  res.setHeader("x-request-id", requestId);
  res.on("finish", () => {
    const elapsedMs = Date.now() - startedAt;
    observability.requestsTotal += 1;
    if (res.statusCode >= 500) observability.errorsTotal += 1;
    observability.requestsByStatus[res.statusCode] = (observability.requestsByStatus[res.statusCode] || 0) + 1;
    const routeKey = `${req.method} ${req.baseUrl || ""}${req.route?.path || req.path || req.originalUrl}`;
    observability.requestsByRoute[routeKey] = (observability.requestsByRoute[routeKey] || 0) + 1;
    console.log(
      JSON.stringify({
        ts: new Date().toISOString(),
        level: res.statusCode >= 500 ? "error" : "info",
        requestId,
        method: req.method,
        path: req.originalUrl,
        status: res.statusCode,
        elapsedMs,
      })
    );
  });
  next();
});

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
const missionRoutes = require("./routes/missions");
app.use("/api/missions", missionRoutes);
const leagueRoutes = require("./routes/leagues");
app.use("/api/leagues", leagueRoutes);
const streakRoutes = require("./routes/streaks");
app.use("/api/streaks", streakRoutes);

// AI / Sprouty Routes
const aiRoutes = require("./routes/ai");
app.use("/api/ai", aiRoutes);

// Admin / Developer
const adminRoutes = require("./routes/adminRoutes");
app.use("/api/admin", adminRoutes);

// Principal
const principalRoutes = require("./routes/principalRoutes");
app.use("/api/principal", principalRoutes);

// Events (Public/Shared for authenticated users)
const eventRoutes = require("./routes/eventRoutes");
app.use("/api/events", eventRoutes);

// Announcements (Student-facing)
const announcementRoutes = require("./routes/announcements");
app.use("/api/announcements", announcementRoutes);

// Health check
app.get("/", (req, res) => {
  res.json({ message: "Backend running...", status: "ok" });
});

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    uptimeSeconds: Math.round(process.uptime()),
    mongoReadyState: mongoose.connection.readyState,
    requestId: req.requestId,
  });
});

app.get("/ready", (req, res) => {
  const isReady = mongoose.connection.readyState === 1; // connected
  if (!isReady) {
    return res.status(503).json({
      status: "not_ready",
      mongoReadyState: mongoose.connection.readyState,
      requestId: req.requestId,
    });
  }
  return res.json({ status: "ready", requestId: req.requestId });
});

app.get("/metrics", (req, res) => {
  res.json({
    status: "ok",
    startedAt: observability.startedAt,
    uptimeSeconds: Math.round(process.uptime()),
    requestsTotal: observability.requestsTotal,
    errorsTotal: observability.errorsTotal,
    errorRate: observability.requestsTotal
      ? Number((observability.errorsTotal / observability.requestsTotal).toFixed(4))
      : 0,
    requestsByStatus: observability.requestsByStatus,
    topRoutes: Object.entries(observability.requestsByRoute)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([route, count]) => ({ route, count })),
    requestId: req.requestId,
  });
});

// 404 and centralized error handling
app.use((req, res) => {
  res.status(404).json({ message: "Route not found", requestId: req.requestId });
});

app.use((err, req, res, next) => {
  const status = Number(err?.status || err?.statusCode || 500);
  const safeMessage = status >= 500 ? "Internal server error" : err?.message || "Request failed";
  console.error("Unhandled error:", {
    requestId: req.requestId,
    method: req.method,
    path: req.originalUrl,
    status,
    message: err?.message,
    stack: err?.stack,
  });
  res.status(status).json({ message: safeMessage, requestId: req.requestId });
});

// MongoDB connection
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/capstone_project";
const PORT = process.env.PORT || 5000;
let server;

async function start() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB Connected");
    await ensureMiniGamesSeeded();
    console.log("✅ Mini-games bootstrap check complete");
    server = app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.log("❌ Mongo Error:", err);
    process.exit(1);
  }
}

async function shutdown(signal) {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  try {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
    await mongoose.connection.close(false);
    console.log("✅ Graceful shutdown complete.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error during shutdown:", err);
    process.exit(1);
  }
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

start();
