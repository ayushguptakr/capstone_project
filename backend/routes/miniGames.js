const express = require("express");
const {
  getMiniGames,
  submitGameScore,
  getGameHistory
} = require("../controllers/miniGameController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, getMiniGames);
router.post("/submit-score", protect, submitGameScore);
router.get("/history", protect, getGameHistory);

module.exports = router;