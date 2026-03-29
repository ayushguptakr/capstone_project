const adaptiveDifficultyEngine = require("../services/adaptiveDifficultyEngine");

/**
 * GET /api/quizzes/adaptive?category=water&limit=10
 */
async function getAdaptiveQuizzes(req, res) {
  try {
    const studentId = req.user.id;
    const category = req.query.category || null;
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const data = await adaptiveDifficultyEngine.getAdaptiveQuizzes(studentId, category, limit);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

/**
 * GET /api/mini-games/adaptive?category=water&limit=10
 */
async function getAdaptiveMiniGames(req, res) {
  try {
    const studentId = req.user.id;
    const category = req.query.category || null;
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const data = await adaptiveDifficultyEngine.getAdaptiveMiniGames(studentId, category, limit);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

module.exports = { getAdaptiveQuizzes, getAdaptiveMiniGames };

