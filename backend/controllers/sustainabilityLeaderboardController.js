const sustainabilityScoreRepository = require("../repositories/sustainabilityScoreRepository");
const { validatePagination, validateSchoolFilter } = require("../validators/ecoImpactValidators");
const { ValidationError } = require("../utils/errors");

/**
 * GET /leaderboard/student
 * Dynamic sustainability ranking - students by adjusted score.
 */
async function getStudentLeaderboard(req, res) {
  try {
    const { limit } = validatePagination(req.query);
    const school = validateSchoolFilter(req.query);
    const list = await sustainabilityScoreRepository.getStudentLeaderboard(limit, school);
    const withRank = list.map((row, i) => ({ ...row, rank: i + 1 }));
    res.json(withRank);
  } catch (err) {
    if (err instanceof ValidationError) return res.status(400).json({ message: err.message });
    res.status(500).json({ message: err.message });
  }
}

/**
 * GET /leaderboard/class
 */
async function getClassLeaderboard(req, res) {
  try {
    const { limit } = validatePagination(req.query);
    const school = validateSchoolFilter(req.query);
    const list = await sustainabilityScoreRepository.getClassLeaderboard(limit, school);
    const withRank = list.map((row, i) => ({ ...row, rank: i + 1 }));
    res.json(withRank);
  } catch (err) {
    if (err instanceof ValidationError) return res.status(400).json({ message: err.message });
    res.status(500).json({ message: err.message });
  }
}

/**
 * GET /leaderboard/school
 */
async function getSchoolLeaderboard(req, res) {
  try {
    const { limit } = validatePagination(req.query);
    const list = await sustainabilityScoreRepository.getSchoolLeaderboard(limit);
    const withRank = list.map((row, i) => ({ ...row, rank: i + 1 }));
    res.json(withRank);
  } catch (err) {
    if (err instanceof ValidationError) return res.status(400).json({ message: err.message });
    res.status(500).json({ message: err.message });
  }
}

module.exports = {
  getStudentLeaderboard,
  getClassLeaderboard,
  getSchoolLeaderboard,
};
