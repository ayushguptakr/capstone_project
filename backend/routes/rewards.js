const express = require("express");
const {
  getRewards,
  redeemReward,
  getRedemptions,
  createReward
} = require("../controllers/rewardController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, getRewards);
router.post("/redeem", protect, redeemReward);
router.get("/my-redemptions", protect, getRedemptions);
router.post("/create", protect, authorize("admin"), createReward);

module.exports = router;