const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const DailyPlan = require("../models/DailyPlan");
const MissionClaim = require("../models/MissionClaim");
const User = require("../models/User");
const { generateEcoPlan } = require("../services/aiService");
const { evaluateBadges } = require("../services/gamificationService");

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

    // 3. Create Claim
    await MissionClaim.create({
      user: userId,
      taskId,
      dateKey: todayStr,
      status: "verified",
      verificationType,
      proofData,
      awardedXP: xpToAward
    });

    // 4. Update user points
    const userObj = await User.findById(userId);
    userObj.points = (userObj.points || 0) + xpToAward;
    userObj.experiencePoints = (userObj.experiencePoints || 0) + xpToAward;
    userObj.weeklyXP = (userObj.weeklyXP || 0) + xpToAward;
    
    // Evaluate badges
    await evaluateBadges(userObj);
    await userObj.save();

    res.json({ success: true, message: "Mission completed", xpAwarded: xpToAward });

  } catch (error) {
    console.error("Error completing mission:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
