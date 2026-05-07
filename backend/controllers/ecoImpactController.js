const ecoImpactLogRepository = require("../repositories/ecoImpactLogRepository");
const sustainabilityRankingService = require("../services/sustainabilityRankingService");
const { validatePagination, validateDateRange, validateSchoolFilter, validateMongoId } = require("../validators/ecoImpactValidators");
const { ValidationError } = require("../utils/errors");
const User = require("../models/User");

function classKeyForUser(user) {
  return user?.classAssigned || user?.className || user?.class || null;
}

async function assertEcoImpactScope({ req, studentId = null, schoolId = null, requireSchool = false }) {
  const role = req.user?.role;
  if (!role) throw new ValidationError("Not authenticated");

  // Admin can view anything
  if (role === "admin") return;

  const mySchool = req.user?.schoolId ? String(req.user.schoolId) : "";
  if (requireSchool && !mySchool) throw new ValidationError("School scope required");

  if (role === "student") {
    // Students can only view their own studentId and never specify arbitrary school scope
    if (studentId && String(studentId) !== String(req.user._id)) {
      throw new ValidationError("Not authorized");
    }
    return;
  }

  if (role === "teacher") {
    // Teacher can view only within their school
    if (schoolId && mySchool && String(schoolId) !== mySchool) throw new ValidationError("Not authorized");
    if (studentId) {
      const student = await User.findById(studentId).select("schoolId className classAssigned class role").lean();
      if (!student || student.role !== "student") throw new ValidationError("Student not found");
      if (String(student.schoolId || "") !== mySchool) throw new ValidationError("Not authorized");
      // Optional class restriction: teacher can only view their class if assigned
      const teacherClass = classKeyForUser(req.user);
      const studentClass = classKeyForUser(student);
      if (teacherClass && studentClass && String(teacherClass) !== String(studentClass)) {
        throw new ValidationError("Not authorized");
      }
    }
    return;
  }

  if (role === "principal") {
    // Principal can view only within their school
    if (schoolId && mySchool && String(schoolId) !== mySchool) throw new ValidationError("Not authorized");
    if (studentId) {
      const student = await User.findById(studentId).select("schoolId role").lean();
      if (!student || student.role !== "student") throw new ValidationError("Student not found");
      if (String(student.schoolId || "") !== mySchool) throw new ValidationError("Not authorized");
    }
    return;
  }

  throw new ValidationError("Not authorized");
}

/**
 * GET /api/eco-impact/student/:studentId
 * Student-level impact (optional date range, pagination).
 */
async function getStudentImpact(req, res) {
  try {
    const studentId = validateMongoId(req.params.studentId, "Student Id");
    await assertEcoImpactScope({ req, studentId });
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
    const requestedSchool = validateSchoolFilter(req.query);
    await assertEcoImpactScope({ req, schoolId: requestedSchool, requireSchool: req.user?.role !== "admin" });
    const school = req.user?.role === "admin" ? requestedSchool : String(req.user.schoolId || "");
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
    // Principal is school-scoped; admin can see all.
    if (req.user?.role === "principal") {
      const mySchool = String(req.user.schoolId || "");
      if (!mySchool) return res.status(400).json({ message: "School scope required" });
      const list = await ecoImpactLogRepository.aggregateBySchool(startDate, endDate, mySchool);
      return res.json(list);
    }
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
    const requestedSchool = validateSchoolFilter(req.query);
    await assertEcoImpactScope({ req, schoolId: requestedSchool, requireSchool: true });
    const school = req.user?.role === "admin" ? requestedSchool : String(req.user.schoolId || "");
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
