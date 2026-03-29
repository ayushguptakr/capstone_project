const express = require("express");
const {
  getMiniGames,
  submitGameScore,
  getGameHistory
} = require("../controllers/miniGameController");
const { getAdaptiveMiniGames } = require("../controllers/adaptiveContentController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, getMiniGames);
router.get("/adaptive", protect, getAdaptiveMiniGames);
router.post("/submit-score", protect, submitGameScore);
router.get("/history", protect, getGameHistory);

module.exports = router;