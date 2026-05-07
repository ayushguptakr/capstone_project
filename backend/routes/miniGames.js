const express = require("express");
const {
  getMiniGames,
  startGameRun,
  submitGameScore,
  getGameHistory
} = require("../controllers/miniGameController");
const { getAdaptiveMiniGames } = require("../controllers/adaptiveContentController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, getMiniGames);
router.get("/adaptive", protect, getAdaptiveMiniGames);
router.post("/start-run", protect, authorizeRoles("student"), startGameRun);
router.post("/submit-score", protect, authorizeRoles("student"), submitGameScore);
router.get("/history", protect, getGameHistory);

module.exports = router;