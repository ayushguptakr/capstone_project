const sustainabilityAnalyticsService = require("../services/sustainabilityAnalyticsService");
const { validateDateRange, validateSchoolFilter } = require("../validators/ecoImpactValidators");
const { ValidationError } = require("../utils/errors");

/**
 * GET /api/analytics/sustainability/totals
 * Total CO₂ reduced, water saved, waste diverted, energy saved.
 */
async function getTotals(req, res) {
  try {
    const school = validateSchoolFilter(req.query);
    const { startDate, endDate } = validateDateRange(req.query);
    const totals = await sustainabilityAnalyticsService.getTotals(school, startDate, endDate);
    res.json({
      ...totals,
      // Compatibility aliases used by existing frontend views.
      co2Reduced: totals.totalCo2Reduced || 0,
      waterSaved: totals.totalWaterSaved || 0,
      wasteDiverted: totals.totalWasteDiverted || 0,
      energySaved: totals.totalEnergySaved || 0,
    });
  } catch (err) {
    if (err instanceof ValidationError) return res.status(400).json({ message: err.message });
    res.status(500).json({ message: err.message });
  }
}

/**
 * GET /api/analytics/sustainability/monthly-trend
 */
async function getMonthlyTrend(req, res) {
  try {
    const school = validateSchoolFilter(req.query);
    const { startDate, endDate } = validateDateRange(req.query);
    const trend = await sustainabilityAnalyticsService.getMonthlyTrend(school, startDate, endDate);
    res.json(trend);
  } catch (err) {
    if (err instanceof ValidationError) return res.status(400).json({ message: err.message });
    res.status(500).json({ message: err.message });
  }
}

/**
 * GET /api/analytics/sustainability/category-impact
 */
async function getCategoryImpact(req, res) {
  try {
    const school = validateSchoolFilter(req.query);
    const { startDate, endDate } = validateDateRange(req.query);
    const data = await sustainabilityAnalyticsService.getCategoryWiseImpact(school, startDate, endDate);
    res.json(
      data.map((row) => ({
        ...row,
        category: row._id || "other",
        totalImpact:
          Number(row.totalCo2Reduced || 0) +
          Number(row.totalWaterSaved || 0) / 100 +
          Number(row.totalWasteDiverted || 0) +
          Number(row.totalEnergySaved || 0),
      }))
    );
  } catch (err) {
    if (err instanceof ValidationError) return res.status(400).json({ message: err.message });
    res.status(500).json({ message: err.message });
  }
}

/**
 * GET /api/analytics/sustainability/green-rating
 * School Green Rating (A/B/C/D).
 */
async function getGreenRating(req, res) {
  try {
    const school = validateSchoolFilter(req.query);
    const ratings = await sustainabilityAnalyticsService.getSchoolGreenRatings(school);
    if (Array.isArray(ratings)) {
      res.json(ratings.map((r) => ({ ...r, rating: r.greenRating || "C" })));
      return;
    }
    res.json(ratings ? { ...ratings, rating: ratings.greenRating || "C" } : null);
  } catch (err) {
    if (err instanceof ValidationError) return res.status(400).json({ message: err.message });
    res.status(500).json({ message: err.message });
  }
}

/**
 * GET /api/analytics/sustainability/dashboard
 * Combined dashboard payload.
 */
async function getDashboard(req, res) {
  try {
    const school = validateSchoolFilter(req.query);
    const { startDate, endDate } = validateDateRange(req.query);
    const [totals, monthlyTrend, categoryImpact, greenRatings] = await Promise.all([
      sustainabilityAnalyticsService.getTotals(school, startDate, endDate),
      sustainabilityAnalyticsService.getMonthlyTrend(school, startDate, endDate),
      sustainabilityAnalyticsService.getCategoryWiseImpact(school, startDate, endDate),
      sustainabilityAnalyticsService.getSchoolGreenRatings(school),
    ]);
    const normalizedTotals = {
      ...totals,
      co2Reduced: totals.totalCo2Reduced || 0,
      waterSaved: totals.totalWaterSaved || 0,
      wasteDiverted: totals.totalWasteDiverted || 0,
      energySaved: totals.totalEnergySaved || 0,
    };
    const normalizedCategoryImpact = categoryImpact.map((row) => ({
      ...row,
      category: row._id || "other",
      totalImpact:
        Number(row.totalCo2Reduced || 0) +
        Number(row.totalWaterSaved || 0) / 100 +
        Number(row.totalWasteDiverted || 0) +
        Number(row.totalEnergySaved || 0),
    }));
    const normalizedRatings = (Array.isArray(greenRatings) ? greenRatings : (greenRatings ? [greenRatings] : [])).map(
      (row) => ({
        ...row,
        rating: row.greenRating || "C",
      })
    );
    res.json({
      totals: normalizedTotals,
      monthlyTrend,
      categoryImpact: normalizedCategoryImpact,
      greenRatings: normalizedRatings,
    });
  } catch (err) {
    if (err instanceof ValidationError) return res.status(400).json({ message: err.message });
    res.status(500).json({ message: err.message });
  }
}

module.exports = {
  getTotals,
  getMonthlyTrend,
  getCategoryImpact,
  getGreenRating,
  getDashboard,
};
