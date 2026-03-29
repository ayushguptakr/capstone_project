const Reward = require("../models/Reward");
const Redemption = require("../models/Redemption");
const User = require("../models/User");

// Get all available rewards (optionally filtered by category)
const getRewards = async (req, res) => {
  try {
    const filter = { isActive: true };
    // stock: -1 means unlimited, otherwise must be > 0
    filter.$or = [{ stock: -1 }, { stock: { $gt: 0 } }];

    if (req.query.category && req.query.category !== "all") {
      filter.category = req.query.category;
    }

    const rewards = await Reward.find(filter).sort({ pointsCost: 1 });
    res.json(rewards);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Redeem a reward
const redeemReward = async (req, res) => {
  try {
    const { rewardId } = req.body;
    const studentId = req.user.id || req.user._id;

    const reward = await Reward.findById(rewardId);
    if (!reward || !reward.isActive) {
      return res.status(404).json({ message: "Reward not available" });
    }
    if (reward.stock !== -1 && reward.stock <= 0) {
      return res.status(400).json({ message: "Out of stock" });
    }

    const student = await User.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "User not found" });
    }
    if (student.points < reward.pointsCost) {
      return res.status(400).json({
        message: "Insufficient XP",
        need: reward.pointsCost - student.points,
      });
    }

    // Create redemption record
    const redemption = new Redemption({
      student: studentId,
      reward: rewardId,
      pointsSpent: reward.pointsCost,
      status: "approved", // instant digital rewards
    });
    await redemption.save();

    // Deduct points
    const updatedUser = await User.findByIdAndUpdate(
      studentId,
      { $inc: { points: -reward.pointsCost } },
      { new: true }
    ).select("points");

    // Decrease stock if not unlimited
    if (reward.stock !== -1) {
      await Reward.findByIdAndUpdate(rewardId, { $inc: { stock: -1 } });
    }

    res.json({
      message: "Reward redeemed successfully!",
      redemption,
      updatedPoints: updatedUser.points,
      reward: {
        name: reward.name,
        icon: reward.icon,
        category: reward.category,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get student's redemption history
const getRedemptions = async (req, res) => {
  try {
    const redemptions = await Redemption.find({ student: req.user.id || req.user._id })
      .populate("reward", "name pointsCost category icon rarity")
      .sort({ createdAt: -1 });
    res.json(redemptions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create reward (admin/teacher only)
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
  createReward,
};