const SustainabilityScore = require("../models/SustainabilityScore");

async function upsertStudentScore(studentId, school, className, data) {
  return SustainabilityScore.findOneAndUpdate(
    { student: studentId, school, className: className || null },
    { $set: { ...data, computedAt: new Date() } },
    { upsert: true, new: true }
  );
}

async function getStudentLeaderboard(limit = 50, school = null) {
  const filter = { student: { $ne: null } };
  if (school) filter.school = school;
  return SustainabilityScore.find(filter)
    .sort({ adjustedScore: -1 })
    .limit(limit)
    .populate("student", "name school badges")
    .lean();
}

async function getClassLeaderboard(limit = 50, school = null) {
  const filter = { student: null, className: { $nin: [null, ""] } };
  if (school) filter.school = school;
  return SustainabilityScore.find(filter)
    .sort({ adjustedScore: -1 })
    .limit(limit)
    .lean();
}

async function getSchoolLeaderboard(limit = 50) {
  return SustainabilityScore.find({ className: null, student: null })
    .sort({ adjustedScore: -1 })
    .limit(limit)
    .lean();
}

/** For class/school level we store one row per class or per school with student=null. */
async function upsertClassScore(school, className, data) {
  return SustainabilityScore.findOneAndUpdate(
    { school, className, student: null },
    { $set: { ...data, computedAt: new Date() } },
    { upsert: true, new: true }
  );
}

async function upsertSchoolScore(school, data) {
  return SustainabilityScore.findOneAndUpdate(
    { school, className: null, student: null },
    { $set: { ...data, computedAt: new Date() } },
    { upsert: true, new: true }
  );
}

module.exports = {
  upsertStudentScore,
  upsertClassScore,
  upsertSchoolScore,
  getStudentLeaderboard,
  getClassLeaderboard,
  getSchoolLeaderboard,
};
