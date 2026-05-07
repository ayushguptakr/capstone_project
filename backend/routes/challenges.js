const express = require("express");
const {
  getChallenges,
  joinChallenge,
  getChallengeProgress,
  createChallenge
} = require("../controllers/challengeController");
const { protect, authorize } = require("../middleware/authMiddleware");
const { requireFeature } = require("../middleware/featureToggle");

const router = express.Router();

router.get("/", protect, requireFeature("competitions"), getChallenges);
router.post("/:challengeId/join", protect, requireFeature("competitions"), joinChallenge);
router.get("/:challengeId/progress", protect, requireFeature("competitions"), getChallengeProgress);
router.post("/create", protect, authorize("teacher", "admin"), requireFeature("competitions"), createChallenge);

module.exports = router;