const Reward = require("../models/Reward");
const Redemption = require("../models/Redemption");
const User = require("../models/User");
const mongoose = require("mongoose");

// Get all available rewards (optionally filtered by category)
const getRewards = async (req, res) => {
  try {
    const limit = Math.max(1, Math.min(100, Number(req.query.limit || 60)));
    const offset = Math.max(0, Number(req.query.offset || 0));
    const filter = { isActive: true };
    // stock: -1 means unlimited, otherwise must be > 0
    filter.$or = [{ stock: -1 }, { stock: { $gt: 0 } }];

    if (req.query.category && req.query.category !== "all") {
      filter.category = req.query.category;
    }

    const total = await Reward.countDocuments(filter);
    const rewards = await Reward.find(filter)
      .sort({ pointsCost: 1, _id: 1 })
      .skip(offset)
      .limit(limit);
    res.json({
      items: rewards,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + rewards.length < total,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Redeem a reward
const redeemReward = async (req, res) => {
  try {
    const { rewardId } = req.body;
    const studentId = req.user.id || req.user._id;

    if (req.user?.role !== "student") {
      return res.status(403).json({ message: "Only students can redeem rewards" });
    }
    if (!rewardId) {
      return res.status(400).json({ message: "rewardId is required" });
    }

    let redemption = null;
    let updatedPoints = 0;
    let rewardMeta = null;

    const executeRedemptionTx = async (session) => {
      const reward = await Reward.findOne({ _id: rewardId, isActive: true }).session(session);
      if (!reward) {
        const err = new Error("Reward not available");
        err.status = 404;
        throw err;
      }

      const updatedUser = await User.findOneAndUpdate(
        { _id: studentId, points: { $gte: reward.pointsCost } },
        { $inc: { points: -reward.pointsCost } },
        { new: true, session }
      ).select("points");

      if (!updatedUser) {
        const student = await User.findById(studentId).select("_id").session(session);
        const err = new Error(student ? "Insufficient XP" : "User not found");
        err.status = student ? 400 : 404;
        throw err;
      }

      if (reward.stock !== -1) {
        const stockUpdated = await Reward.findOneAndUpdate(
          { _id: rewardId, isActive: true, stock: { $gt: 0 } },
          { $inc: { stock: -1 } },
          { new: false, session }
        );
        if (!stockUpdated) {
          const err = new Error("Out of stock");
          err.status = 400;
          throw err;
        }
      }

      redemption = await Redemption.create(
        [
          {
            student: studentId,
            reward: rewardId,
            pointsSpent: reward.pointsCost,
            status: "approved",
          },
        ],
        { session }
      ).then((docs) => docs[0]);

      updatedPoints = Number(updatedUser.points || 0);
      rewardMeta = {
        name: reward.name,
        icon: reward.icon,
        category: reward.category,
      };
    };

    try {
      const session = await mongoose.startSession();
      try {
        await session.withTransaction(async () => {
          await executeRedemptionTx(session);
        });
      } finally {
        await session.endSession();
      }
    } catch (txError) {
      // Dev fallback for standalone Mongo servers (no transactions support).
      const isTxUnsupported = /Transaction numbers are only allowed|does not support transactions|replica set/i.test(
        String(txError?.message || "")
      );
      if (!isTxUnsupported || process.env.NODE_ENV === "production") {
        if (txError?.status) return res.status(txError.status).json({ message: txError.message });
        throw txError;
      }
      await executeRedemptionTx(null);
    }

    res.json({
      message: "Reward redeemed successfully!",
      redemption,
      updatedPoints,
      reward: rewardMeta,
    });
  } catch (error) {
    if (error?.status) return res.status(error.status).json({ message: error.message });
    res.status(500).json({ message: error.message });
  }
};

// Get student's redemption history
const getRedemptions = async (req, res) => {
  try {
    const limit = Math.max(1, Math.min(100, Number(req.query.limit || 20)));
    const offset = Math.max(0, Number(req.query.offset || 0));
    const filter = { student: req.user.id || req.user._id };
    const total = await Redemption.countDocuments(filter);
    const redemptions = await Redemption.find(filter)
      .populate("reward", "name pointsCost category icon rarity")
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit);
    res.json({
      items: redemptions,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + redemptions.length < total,
      },
    });
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