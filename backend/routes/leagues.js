const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { protect, requirePasswordSet } = require("../middleware/authMiddleware");

const LEAGUE_THRESHOLDS = {
  bronze: { promote: 200, demote: 0 },
  silver: { promote: 500, demote: 100 },
  gold:   { promote: 1000, demote: 250 },
  diamond: { promote: Infinity, demote: 500 }
};

const LEAGUE_ORDER = ["bronze", "silver", "gold", "diamond"];

/**
 * GET /api/leagues/status — Current user's league info
 */
router.get("/status", protect, requirePasswordSet, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("league weeklyXP points streakCurrent level").lean();
    if (!user) return res.status(404).json({ message: "User not found" });

    const idx = LEAGUE_ORDER.indexOf(user.league || "bronze");
    const current = LEAGUE_ORDER[idx] || "bronze";
    const threshold = LEAGUE_THRESHOLDS[current];

    res.json({
      league: current,
      weeklyXP: user.weeklyXP || 0,
      promoteAt: threshold.promote,
      demoteAt: threshold.demote,
      nextLeague: LEAGUE_ORDER[idx + 1] || null,
      prevLeague: idx > 0 ? LEAGUE_ORDER[idx - 1] : null
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * POST /api/leagues/weekly-reset — Run weekly league evaluation.
 * Call this from a cron job or admin trigger every Sunday midnight.
 */
router.post("/weekly-reset", protect, async (req, res) => {
  try {
    // Only allow admin/developer to trigger
    if (!["admin", "developer"].includes(req.user.role)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const students = await User.find({ role: "student" });

    let promoted = 0, demoted = 0, held = 0;

    for (const user of students) {
      const currentIdx = LEAGUE_ORDER.indexOf(user.league || "bronze");
      const threshold = LEAGUE_THRESHOLDS[user.league || "bronze"];
      const wxp = user.weeklyXP || 0;

      if (wxp >= threshold.promote && currentIdx < LEAGUE_ORDER.length - 1) {
        // Promote
        user.league = LEAGUE_ORDER[currentIdx + 1];
        promoted++;
      } else if (wxp < threshold.demote && currentIdx > 0) {
        // Demote
        user.league = LEAGUE_ORDER[currentIdx - 1];
        demoted++;
      } else {
        held++;
      }

      // Reset weekly XP
      user.weeklyXP = 0;
      await user.save();
    }

    res.json({
      message: "Weekly league reset complete",
      results: { promoted, demoted, held, total: students.length }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
