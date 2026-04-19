const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { protect, requirePasswordSet } = require("../middleware/authMiddleware");

/**
 * POST /api/streaks/freeze — Spend green credits to protect streak for 1 day.
 * Cost: 50 green credits per freeze.
 * Max: 1 active freeze at a time.
 */
router.post("/freeze", protect, requirePasswordSet, async (req, res) => {
  try {
    const FREEZE_COST = 50;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Check if already frozen today
    if (user.streakFreezeUntil && new Date(user.streakFreezeUntil) > new Date()) {
      return res.status(400).json({ message: "Streak freeze already active" });
    }

    // Check sufficient credits
    const credits = user.greenCredits || 0;
    if (credits < FREEZE_COST) {
      return res.status(400).json({
        message: `Not enough Green Credits. Need ${FREEZE_COST}, have ${credits}.`
      });
    }

    // Apply freeze — protects until end of tomorrow
    const freezeUntil = new Date();
    freezeUntil.setDate(freezeUntil.getDate() + 1);
    freezeUntil.setHours(23, 59, 59, 999);

    user.greenCredits = credits - FREEZE_COST;
    user.streakFreezeUntil = freezeUntil;
    await user.save();

    res.json({
      success: true,
      message: "Streak freeze activated! Your streak is safe for 24 hours.",
      freezeUntil,
      greenCreditsRemaining: user.greenCredits
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * GET /api/streaks/status — Current streak status.
 */
router.get("/status", protect, requirePasswordSet, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select("streakCurrent streakLastActiveAt streakFreezeUntil greenCredits")
      .lean();

    if (!user) return res.status(404).json({ message: "User not found" });

    const isFrozen = user.streakFreezeUntil && new Date(user.streakFreezeUntil) > new Date();

    res.json({
      streak: user.streakCurrent || 0,
      lastActive: user.streakLastActiveAt,
      isFrozen,
      freezeUntil: isFrozen ? user.streakFreezeUntil : null,
      greenCredits: user.greenCredits || 0,
      freezeCost: 50
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
