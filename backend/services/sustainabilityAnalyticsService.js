/**
 * Sustainability Analytics Dashboard data.
 * Total CO₂, water, waste, monthly trends, category impact, School Green Rating.
 */
const ecoImpactLogRepository = require("../repositories/ecoImpactLogRepository");
const EcoImpactLog = require("../models/EcoImpactLog");

/** Green rating thresholds (e.g. total impact score per student). */
const RATING_THRESHOLDS = {
  A: 100,
  B: 50,
  C: 20,
};
/** Below C threshold = "D" or unrated. */

function getSchoolGreenRating(totalImpactValue, studentCount) {
  if (!studentCount || studentCount < 1) return "C";
  const perCapita = totalImpactValue / studentCount;
  if (perCapita >= RATING_THRESHOLDS.A) return "A";
  if (perCapita >= RATING_THRESHOLDS.B) return "B";
  if (perCapita >= RATING_THRESHOLDS.C) return "C";
  return "D";
}

/**
 * Dashboard totals for a school or global.
 */
async function getTotals(school = null, startDate = null, endDate = null) {
  const agg = await ecoImpactLogRepository.aggregateBySchool(startDate, endDate);
  if (school) {
    const row = agg.find((r) => r._id === school);
    return row
      ? {
          totalCo2Reduced: row.totalCo2Reduced,
          totalWaterSaved: row.totalWaterSaved,
          totalWasteDiverted: row.totalWasteDiverted,
          totalEnergySaved: row.totalEnergySaved,
          uniqueStudents: row.uniqueStudents,
          count: row.count,
        }
      : {
          totalCo2Reduced: 0,
          totalWaterSaved: 0,
          totalWasteDiverted: 0,
          totalEnergySaved: 0,
          uniqueStudents: 0,
          count: 0,
        };
  }
  const totals = agg.reduce(
    (acc, r) => ({
      totalCo2Reduced: acc.totalCo2Reduced + (r.totalCo2Reduced || 0),
      totalWaterSaved: acc.totalWaterSaved + (r.totalWaterSaved || 0),
      totalWasteDiverted: acc.totalWasteDiverted + (r.totalWasteDiverted || 0),
      totalEnergySaved: acc.totalEnergySaved + (r.totalEnergySaved || 0),
      count: acc.count + (r.count || 0),
    }),
    { totalCo2Reduced: 0, totalWaterSaved: 0, totalWasteDiverted: 0, totalEnergySaved: 0, count: 0 }
  );
  return totals;
}

/**
 * Monthly trend for graphs.
 */
async function getMonthlyTrend(school = null, startDate = null, endDate = null) {
  return ecoImpactLogRepository.monthlyTrend(school, startDate, endDate);
}

/**
 * Category-wise environmental impact.
 */
async function getCategoryWiseImpact(school = null, startDate = null, endDate = null) {
  return ecoImpactLogRepository.categoryWiseImpact(school, startDate, endDate);
}

/**
 * School Green Rating for all schools (or one).
 */
async function getSchoolGreenRatings(school = null) {
  const agg = await ecoImpactLogRepository.aggregateBySchool();
  const User = require("../models/User");
  const ratings = [];
  for (const row of agg) {
    const s = row._id;
    if (school && s !== school) continue;
    const studentCount = await User.countDocuments({ role: "student", school: s });
    const totalImpactValue = row.totalImpactValue || 0;
    ratings.push({
      school: s,
      studentCount,
      totalImpactValue,
      greenRating: getSchoolGreenRating(totalImpactValue, studentCount),
    });
  }
  return school ? ratings[0] || null : ratings;
}

module.exports = {
  getTotals,
  getMonthlyTrend,
  getCategoryWiseImpact,
  getSchoolGreenRatings,
  getSchoolGreenRating,
  RATING_THRESHOLDS,
};
