const recommendationEngine = require("../services/recommendationEngine");
const { validateMongoId } = require("../validators/ecoImpactValidators");
const { ValidationError } = require("../utils/errors");

/**
 * GET /api/recommendations/tasks
 * Recommended eco-tasks for current user (student) by impact improvement potential.
 */
async function getRecommendedTasks(req, res) {
  try {
    const studentId = req.user.id;
    const user = req.user;
    const school = user.school || null;
    const limit = Math.min(20, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const tasks = await recommendationEngine.getRecommendedTasks(studentId, school, limit);
    res.json({ recommendations: tasks });
  } catch (err) {
    if (err instanceof ValidationError) return res.status(400).json({ message: err.message });
    res.status(500).json({ message: err.message });
  }
}

/**
 * GET /api/recommendations/weak-category
 */
async function getWeakCategory(req, res) {
  try {
    const category = await recommendationEngine.getWeakCategory(req.user.id);
    res.json({ weakCategory: category });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

module.exports = {
  getRecommendedTasks,
  getWeakCategory,
};
