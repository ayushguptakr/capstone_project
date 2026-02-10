const express = require("express");
const {
  getChallenges,
  joinChallenge,
  getChallengeProgress,
  createChallenge
} = require("../controllers/challengeController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, getChallenges);
router.post("/:challengeId/join", protect, joinChallenge);
router.get("/:challengeId/progress", protect, getChallengeProgress);
router.post("/create", protect, authorize("teacher", "admin"), createChallenge);

module.exports = router;