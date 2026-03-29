const express = require("express");
const {
  getLeaderboard,
  getStudentProgress,
  getSchoolLeaderboard,
} = require("../controllers/leaderboardController");
const {
  getStudentLeaderboard,
  getClassLeaderboard,
  getSchoolLeaderboard: getSustainabilitySchoolLeaderboard,
} = require("../controllers/sustainabilityLeaderboardController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, getLeaderboard);
router.get("/progress", protect, getStudentProgress);
router.get("/schools", protect, getSchoolLeaderboard);
// Dynamic sustainability ranking (adjusted score)
router.get("/student", protect, getStudentLeaderboard);
router.get("/class", protect, getClassLeaderboard);
router.get("/school", protect, getSustainabilitySchoolLeaderboard);

module.exports = router;