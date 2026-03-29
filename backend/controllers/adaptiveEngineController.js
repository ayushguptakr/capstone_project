const AdaptiveProfile = require("../models/AdaptiveProfile");
const adaptiveDifficultyEngine = require("../services/adaptiveDifficultyEngine");

/**
 * GET /api/adaptive-engine/me?category=water
 * Returns current adaptive profile snapshot + computed adjustments.
 */
async function getMyAdaptiveState(req, res) {
  try {
    const studentId = req.user.id;
    const category = req.query.category || null;
    const adjustments = await adaptiveDifficultyEngine.computeAdjustments(studentId, category);
    const profile = await AdaptiveProfile.findOne({ student: studentId }).lean();
    res.json({ adjustments, profile });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

module.exports = { getMyAdaptiveState };

