/**
 * Adaptive Eco-Task Recommendation Engine
 * Suggests tasks by: weak sustainability category, participation frequency, local focus.
 */
const Task = require("../models/Task");
const Submission = require("../models/Submission");
const EcoImpactLog = require("../models/EcoImpactLog");

/**
 * Find user's weak category (lowest impact in category-wise contribution).
 */
async function getWeakCategory(studentId, limit = 90) {
  const since = new Date();
  since.setDate(since.getDate() - limit);
  const byCategory = await EcoImpactLog.aggregate([
    { $match: { student: studentId, createdAt: { $gte: since } } },
    { $lookup: { from: "tasks", localField: "task", foreignField: "_id", as: "t" } },
    { $unwind: "$t" },
    {
      $group: {
        _id: "$t.category",
        totalImpact: { $sum: "$impactValue" },
        count: { $sum: 1 },
      },
    },
    { $sort: { totalImpact: 1 } },
  ]);
  if (byCategory.length === 0) return null;
  return byCategory[0]._id || "general";
}

/**
 * Past participation frequency: tasks submitted per week in window.
 */
async function getParticipationFrequency(studentId, days = 90) {
  const since = new Date();
  since.setDate(since.getDate() - days);
  const count = await Submission.countDocuments({
    student: studentId,
    status: "approved",
    createdAt: { $gte: since },
  });
  const weeks = days / 7;
  return count / weeks;
}

/**
 * Local environmental focus: prefer categories that match school/region focus.
 * For now we use school's top category from aggregate impact as "local focus".
 */
async function getLocalFocusCategory(school) {
  if (!school) return null;
  const result = await EcoImpactLog.aggregate([
    { $match: { school } },
    { $lookup: { from: "tasks", localField: "task", foreignField: "_id", as: "t" } },
    { $unwind: "$t" },
    { $group: { _id: "$t.category", total: { $sum: "$impactValue" } } },
    { $sort: { total: -1 } },
    { $limit: 1 },
  ]);
  return result.length ? result[0]._id : null;
}

/**
 * Tasks already completed by student (approved).
 */
async function getCompletedTaskIds(studentId) {
  const subs = await Submission.find({
    student: studentId,
    status: "approved",
  })
    .select("task")
    .lean();
  return [...new Set(subs.map((s) => s.task.toString()))];
}

/**
 * Recommended tasks ranked by impact improvement potential.
 * Prioritize: weak category, then local focus, then by task difficulty/points.
 */
async function getRecommendedTasks(studentId, school, limit = 10) {
  const weakCategory = await getWeakCategory(studentId);
  const localFocus = await getLocalFocusCategory(school);
  const completedIds = await getCompletedTaskIds(studentId);

  const allTasks = await Task.find({
    _id: { $nin: completedIds },
  })
    .select("title description points category difficulty impact_model")
    .lean();

  const scored = allTasks.map((task) => {
    let score = 0;
    const cat = task.category || "general";
    if (weakCategory && cat === weakCategory) score += 50;
    if (localFocus && cat === localFocus) score += 30;
    score += (task.difficulty || 1) * 5;
    score += (task.points || 0) * 0.5;
    const impactWeight = task.impact_model?.impact_weight || 1;
    score += impactWeight * 10;
    return { task, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((s) => s.task);
}

module.exports = {
  getWeakCategory,
  getParticipationFrequency,
  getLocalFocusCategory,
  getRecommendedTasks,
};
