const Reward = require("../models/Reward");
const Redemption = require("../models/Redemption");
const User = require("../models/User");

// Get all available rewards
const getRewards = async (req, res) => {
  try {
    const rewards = await Reward.find({ isActive: true, stock: { $gt: 0 } })
      .sort({ pointsCost: 1 });
    res.json(rewards);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Redeem a reward
const redeemReward = async (req, res) => {
  try {
    const { rewardId, deliveryAddress } = req.body;
    const studentId = req.user.id;

    const reward = await Reward.findById(rewardId);
    if (!reward || !reward.isActive || reward.stock <= 0) {
      return res.status(404).json({ message: "Reward not available" });
    }

    const student = await User.findById(studentId);
    if (student.points < reward.pointsCost) {
      return res.status(400).json({ message: "Insufficient points" });
    }

    // Create redemption record
    const redemption = new Redemption({
      student: studentId,
      reward: rewardId,
      pointsSpent: reward.pointsCost,
      deliveryAddress
    });

    await redemption.save();

    // Deduct points and update stock
    await User.findByIdAndUpdate(studentId, {
      $inc: { points: -reward.pointsCost }
    });

    await Reward.findByIdAndUpdate(rewardId, {
      $inc: { stock: -1 }
    });

    res.json({ message: "Reward redeemed successfully", redemption });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get student's redemption history
const getRedemptions = async (req, res) => {
  try {
    const redemptions = await Redemption.find({ student: req.user.id })
      .populate("reward", "name pointsCost category")
      .sort({ createdAt: -1 });
    res.json(redemptions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create reward (admin only)
const createReward = async (req, res) => {
  try {
    const reward = new Reward(req.body);
    await reward.save();
    res.status(201).json({ message: "Reward created successfully", reward });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getRewards,
  redeemReward,
  getRedemptions,
  createReward
};