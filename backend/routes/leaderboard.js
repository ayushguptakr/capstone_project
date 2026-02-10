const express = require("express");
const {
  getLeaderboard,
  getStudentProgress,
  getSchoolLeaderboard
} = require("../controllers/leaderboardController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, getLeaderboard);
router.get("/progress", protect, getStudentProgress);
router.get("/schools", protect, getSchoolLeaderboard);

module.exports = router;