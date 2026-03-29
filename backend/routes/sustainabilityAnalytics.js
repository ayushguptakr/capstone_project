const express = require("express");
const router = express.Router();
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const {
  getTotals,
  getMonthlyTrend,
  getCategoryImpact,
  getGreenRating,
  getDashboard,
} = require("../controllers/sustainabilityAnalyticsController");

router.get("/totals", protect, getTotals);
router.get("/monthly-trend", protect, getMonthlyTrend);
router.get("/category-impact", protect, getCategoryImpact);
router.get("/green-rating", protect, getGreenRating);
router.get("/dashboard", protect, getDashboard);

module.exports = router;
