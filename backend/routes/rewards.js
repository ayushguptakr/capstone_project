const express = require("express");
const {
  getRewards,
  redeemReward,
  getRedemptions,
  createReward
} = require("../controllers/rewardController");
const { protect, authorize } = require("../middleware/authMiddleware");
const { requireFeature } = require("../middleware/featureToggle");

const router = express.Router();

router.get("/", protect, requireFeature("rewards"), getRewards);
router.post("/redeem", protect, authorize("student"), requireFeature("rewards"), redeemReward);
router.get("/my-redemptions", protect, authorize("student"), requireFeature("rewards"), getRedemptions);
router.post("/create", protect, authorize("admin"), createReward);

module.exports = router;