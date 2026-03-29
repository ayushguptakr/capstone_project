const ecoImpactLogRepository = require("../repositories/ecoImpactLogRepository");
const sustainabilityRankingService = require("../services/sustainabilityRankingService");
const { validatePagination, validateDateRange, validateSchoolFilter, validateMongoId } = require("../validators/ecoImpactValidators");
const { ValidationError } = require("../utils/errors");

/**
 * GET /api/eco-impact/student/:studentId
 * Student-level impact (optional date range, pagination).
 */
async function getStudentImpact(req, res) {
  try {
    const studentId = validateMongoId(req.params.studentId, "Student Id");
    const { startDate, endDate } = validateDateRange(req.query);
    const { limit, skip } = validatePagination(req.query);
    const options = { startDate, endDate };
    let logs = await ecoImpactLogRepository.findByStudent(studentId, options);
    const total = logs.length;
    logs = logs.slice(skip, skip + limit);
    const totals = logs.reduce(
      (acc, l) => ({
        co2Reduced: acc.co2Reduced + (l.co2Reduced || 0),
        waterSaved: acc.waterSaved + (l.waterSaved || 0),
        wasteDiverted: acc.wasteDiverted + (l.wasteDiverted || 0),
        energySaved: acc.energySaved + (l.energySaved || 0),
      }),
      { co2Reduced: 0, waterSaved: 0, wasteDiverted: 0, energySaved: 0 }
    );
    res.json({ logs, totals, total, limit, skip });
  } catch (err) {
    if (err instanceof ValidationError) return res.status(400).json({ message: err.message });
    res.status(500).json({ message: err.message });
  }
}

/**
 * GET /api/eco-impact/aggregate/student
 * Leaderboard by impact (students).
 */
async function getStudentAggregate(req, res) {
  try {
    const school = validateSchoolFilter(req.query);
    const { startDate, endDate } = validateDateRange(req.query);
    const list = await ecoImpactLogRepository.aggregateByStudent(school, startDate, endDate);
    res.json(list);
  } catch (err) {
    if (err instanceof ValidationError) return res.status(400).json({ message: err.message });
    res.status(500).json({ message: err.message });
  }
}

/**
 * GET /api/eco-impact/aggregate/school
 */
async function getSchoolAggregate(req, res) {
  try {
    const { startDate, endDate } = validateDateRange(req.query);
    const list = await ecoImpactLogRepository.aggregateBySchool(startDate, endDate);
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

/**
 * GET /api/eco-impact/aggregate/class
 */
async function getClassAggregate(req, res) {
  try {
    const school = validateSchoolFilter(req.query);
    if (!school) return res.status(400).json({ message: "School filter required for class aggregate" });
    const { startDate, endDate } = validateDateRange(req.query);
    const list = await ecoImpactLogRepository.aggregateByClass(school, startDate, endDate);
    res.json(list);
  } catch (err) {
    if (err instanceof ValidationError) return res.status(400).json({ message: err.message });
    res.status(500).json({ message: err.message });
  }
}

/**
 * POST /api/eco-impact/refresh-ranking/:studentId
 * Refresh sustainability score for a student (admin/teacher).
 */
async function refreshRanking(req, res) {
  try {
    const studentId = validateMongoId(req.params.studentId, "Student Id");
    const score = await sustainabilityRankingService.refreshRankingForStudent(studentId);
    res.json({ message: "Ranking refreshed", score });
  } catch (err) {
    if (err instanceof ValidationError) return res.status(400).json({ message: err.message });
    res.status(500).json({ message: err.message });
  }
}

module.exports = {
  getStudentImpact,
  getStudentAggregate,
  getSchoolAggregate,
  getClassAggregate,
  refreshRanking,
};
