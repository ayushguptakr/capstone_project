const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const DailyPlan = require("../models/DailyPlan");
const MissionClaim = require("../models/MissionClaim");
const User = require("../models/User");
const { generateEcoPlan } = require("../services/aiService");
const gamificationService = require("../services/gamificationService");

// GET /api/missions/today
// Returns today's daily plan and the completed statuses
router.get("/today", protect, async (req, res) => {
  try {
    const todayStr = new Date().toISOString().split("T")[0];
    const userId = req.user._id;

    // 1. Fetch or generate the plan
    let planDoc = await DailyPlan.findOne({ user: userId, dateKey: todayStr });
    
    if (!planDoc) {
      // Generate new plan from AI
      const planTasks = await generateEcoPlan(req.user.streakCurrent || 0, req.user.missionsCompleted || 0, req.user.level || 1);
      
      // Assign stable IDs
      const tasksWithIds = planTasks.map((t, index) => ({
        ...t,
        taskId: `${userId.toString()}_${todayStr}_${index}`
      }));
      
      planDoc = await DailyPlan.create({
        user: userId,
        dateKey: todayStr,
        tasks: tasksWithIds
      });
    }

    // 2. Fetch completion statuses
    const claims = await MissionClaim.find({ user: userId, dateKey: todayStr });
    const completedTaskIds = new Set(claims.map(c => c.taskId));

    res.json({
      success: true,
      plan: planDoc.tasks,
      completedTaskIds: Array.from(completedTaskIds)
    });

  } catch (error) {
    console.error("Error fetching daily mission plan:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// POST /api/missions/complete
// Commits a mission verification, enforcing limits
router.post("/complete", protect, async (req, res) => {
  try {
    const { taskId, verificationType, proofData } = req.body;
    const todayStr = new Date().toISOString().split("T")[0];
    const userId = req.user._id;

    if (!taskId || typeof taskId !== "string") {
      return res.status(400).json({ success: false, message: "taskId is required" });
    }
    if (!verificationType || typeof verificationType !== "string") {
      return res.status(400).json({ success: false, message: "verificationType is required" });
    }

    // Ensure taskId is from today's plan (prevents forging arbitrary IDs)
    const planDoc = await DailyPlan.findOne({ user: userId, dateKey: todayStr }).lean();
    if (!planDoc) {
      return res.status(400).json({ success: false, message: "Daily plan not found. Load /missions/today first." });
    }
    const planned = Array.isArray(planDoc.tasks)
      ? planDoc.tasks.find((t) => t && t.taskId === taskId)
      : null;
    if (!planned) {
      return res.status(403).json({ success: false, message: "Invalid mission for today." });
    }
    if (String(planned.verificationType) !== String(verificationType)) {
      return res.status(400).json({ success: false, message: "verificationType does not match the mission." });
    }

    // Proof requirements
    if (verificationType === "proof" || verificationType === "quiz") {
      if (typeof proofData !== "string" || proofData.trim().length < 2) {
        return res.status(400).json({ success: false, message: "proofData is required for this verification type." });
      }
    }

    // 1. Check if already claimed
    const existingClaim = await MissionClaim.findOne({ user: userId, taskId, dateKey: todayStr });
    if (existingClaim) {
      return res.status(400).json({ success: false, message: "Already claimed" });
    }

    // 2. Check Daily XP limits
    const claimsToday = await MissionClaim.find({ user: userId, dateKey: todayStr });
    const xpEarnedToday = claimsToday.reduce((sum, c) => sum + c.awardedXP, 0);
    
    if (xpEarnedToday >= 50) {
      return res.status(400).json({ success: false, message: "Daily task XP limit reached (50 XP)" });
    }

    // Calculate XP for this task type (quick: 10, proof: 15, quiz: 20) — capping logically
    let xpToAward = 10;
    if (verificationType === "proof") xpToAward = 15;
    if (verificationType === "quiz") xpToAward = 20;
    
    // Ensure we don't breach the cap
    if (xpEarnedToday + xpToAward > 50) xpToAward = 50 - xpEarnedToday;

    // 3. Create Claim (idempotent at DB level too)
    let claim;
    try {
      claim = await MissionClaim.create({
        user: userId,
        taskId,
        dateKey: todayStr,
        status: "verified",
        verificationType,
        proofData,
        awardedXP: xpToAward
      });
    } catch (e) {
      if (e?.code === 11000) {
        return res.status(400).json({ success: false, message: "Already claimed" });
      }
      throw e;
    }

    // 4. Award XP through central service for consistent streak/level/badges/plant
    await gamificationService.awardPoints({
      userId,
      points: xpToAward,
      source: "mission",
      sourceRef: taskId,
      idempotencyKey: `mission-claim:${userId.toString()}:${todayStr}:${taskId}`,
      metadata: { verificationType, claimId: String(claim._id) },
    });

    res.json({ success: true, message: "Mission completed", xpAwarded: xpToAward });

  } catch (error) {
    console.error("Error completing mission:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
