/**
 * Dynamic Sustainability Ranking Algorithm
 * Adjusted Score = (Impact Score × Consistency Index × Time Recency Factor) / School Population Normalizer
 */
const EcoImpactLog = require("../models/EcoImpactLog");
const User = require("../models/User");
const sustainabilityScoreRepository = require("../repositories/sustainabilityScoreRepository");
const {
  timeRecencyFactor,
  consistencyMultiplierFromFrequency,
  schoolPopulationNormalizer,
  adjustedSustainabilityScore,
} = require("../utils/formulas");

/** How many days of impact to consider for impact score. */
const IMPACT_WINDOW_DAYS = 90;

function getWindowStart() {
  const d = new Date();
  d.setDate(d.getDate() - IMPACT_WINDOW_DAYS);
  return d;
}

/**
 * Compute impact score (time-weighted sum of impactValue) for a set of logs.
 */
function weightedImpactScore(logs) {
  let sum = 0;
  for (const log of logs) {
    const recency = timeRecencyFactor(log.createdAt);
    sum += (log.impactValue || 0) * recency;
  }
  return sum;
}

/**
 * Consistency: participation frequency. Approximate by (actions in window / weeks) / 2 (e.g. 2 per week = 1).
 */
function computeConsistencyIndex(logs) {
  if (!logs || logs.length === 0) return 0.5;
  const weeks = IMPACT_WINDOW_DAYS / 7;
  const frequency = Math.min(2, logs.length / weeks) / 2;
  return consistencyMultiplierFromFrequency(frequency);
}

/**
 * Time recency factor for the whole window (average or use latest activity).
 */
function windowTimeRecencyFactor(logs) {
  if (!logs || logs.length === 0) return 0.5;
  const latest = logs.reduce((acc, l) => (l.createdAt > acc ? l.createdAt : acc), new Date(0));
  return timeRecencyFactor(latest);
}

/**
 * Recompute and persist sustainability scores for one student.
 */
async function refreshStudentScore(studentId) {
  const user = await User.findById(studentId).select("school className").lean();
  if (!user) return null;
  const windowStart = getWindowStart();
  const logs = await EcoImpactLog.find({
    student: studentId,
    createdAt: { $gte: windowStart },
  }).lean();

  const impactScore = weightedImpactScore(logs);
  const consistencyIndex = computeConsistencyIndex(logs);
  const timeRecencyFactorVal = windowTimeRecencyFactor(logs);
  const schoolStudentCount = await User.countDocuments({
    role: "student",
    school: user.school,
  });
  const populationNormalizer = schoolPopulationNormalizer(schoolStudentCount);
  const adjusted = adjustedSustainabilityScore(
    impactScore,
    consistencyIndex,
    timeRecencyFactorVal,
    populationNormalizer
  );

  const totals = logs.reduce(
    (acc, l) => ({
      totalCo2Reduced: acc.totalCo2Reduced + (l.co2Reduced || 0),
      totalWaterSaved: acc.totalWaterSaved + (l.waterSaved || 0),
      totalWasteDiverted: acc.totalWasteDiverted + (l.wasteDiverted || 0),
      totalEnergySaved: acc.totalEnergySaved + (l.energySaved || 0),
    }),
    { totalCo2Reduced: 0, totalWaterSaved: 0, totalWasteDiverted: 0, totalEnergySaved: 0 }
  );

  return sustainabilityScoreRepository.upsertStudentScore(
    studentId,
    user.school || "",
    user.className || null,
    {
      impactScore,
      consistencyIndex,
      timeRecencyFactor: timeRecencyFactorVal,
      populationNormalizer,
      adjustedScore: adjusted,
      ...totals,
    }
  );
}

/**
 * Recompute class-level and school-level scores (aggregate from logs).
 */
async function refreshClassAndSchoolScores(school) {
  const windowStart = getWindowStart();
  const studentCount = await User.countDocuments({ role: "student", school });
  const normalizer = schoolPopulationNormalizer(studentCount);

  const classAgg = await EcoImpactLog.aggregate([
    { $match: { school, createdAt: { $gte: windowStart } } },
    { $group: { _id: "$className", logs: { $push: "$$ROOT" } } },
  ]);

  for (const row of classAgg) {
    const logs = row.logs;
    const impactScore = weightedImpactScore(logs);
    const consistencyIndex = computeConsistencyIndex(logs);
    const timeRecencyFactorVal = windowTimeRecencyFactor(logs);
    const adjusted = adjustedSustainabilityScore(
      impactScore,
      consistencyIndex,
      timeRecencyFactorVal,
      normalizer
    );
    const totals = logs.reduce(
      (acc, l) => ({
        totalCo2Reduced: acc.totalCo2Reduced + (l.co2Reduced || 0),
        totalWaterSaved: acc.totalWaterSaved + (l.waterSaved || 0),
        totalWasteDiverted: acc.totalWasteDiverted + (l.wasteDiverted || 0),
        totalEnergySaved: acc.totalEnergySaved + (l.energySaved || 0),
      }),
      { totalCo2Reduced: 0, totalWaterSaved: 0, totalWasteDiverted: 0, totalEnergySaved: 0 }
    );
    await sustainabilityScoreRepository.upsertClassScore(school, row._id || "", {
      impactScore,
      consistencyIndex,
      timeRecencyFactor: timeRecencyFactorVal,
      populationNormalizer: normalizer,
      adjustedScore: adjusted,
      ...totals,
    });
  }

  const schoolLogs = await EcoImpactLog.find({
    school,
    createdAt: { $gte: windowStart },
  }).lean();
  const schoolImpactScore = weightedImpactScore(schoolLogs);
  const schoolConsistency = computeConsistencyIndex(schoolLogs);
  const schoolRecency = windowTimeRecencyFactor(schoolLogs);
  const schoolAdjusted = adjustedSustainabilityScore(
    schoolImpactScore,
    schoolConsistency,
    schoolRecency,
    normalizer
  );
  const schoolTotals = schoolLogs.reduce(
    (acc, l) => ({
      totalCo2Reduced: acc.totalCo2Reduced + (l.co2Reduced || 0),
      totalWaterSaved: acc.totalWaterSaved + (l.waterSaved || 0),
      totalWasteDiverted: acc.totalWasteDiverted + (l.wasteDiverted || 0),
      totalEnergySaved: acc.totalEnergySaved + (l.energySaved || 0),
    }),
    { totalCo2Reduced: 0, totalWaterSaved: 0, totalWasteDiverted: 0, totalEnergySaved: 0 }
  );
  await sustainabilityScoreRepository.upsertSchoolScore(school, {
    impactScore: schoolImpactScore,
    consistencyIndex: schoolConsistency,
    timeRecencyFactor: schoolRecency,
    populationNormalizer: normalizer,
    adjustedScore: schoolAdjusted,
    ...schoolTotals,
  });
}

/**
 * Refresh ranking for a student and their school (and class).
 */
async function refreshRankingForStudent(studentId) {
  const score = await refreshStudentScore(studentId);
  const user = await User.findById(studentId).select("school").lean();
  if (user?.school) await refreshClassAndSchoolScores(user.school);
  return score;
}

module.exports = {
  refreshStudentScore,
  refreshClassAndSchoolScores,
  refreshRankingForStudent,
  getWindowStart,
  weightedImpactScore,
};
