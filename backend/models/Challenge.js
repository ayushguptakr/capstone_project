const mongoose = require("mongoose");

const challengeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    pointsReward: { type: Number, default: 50 },
    badgeReward: {
      title: String,
      icon: String
    },
    targetType: { 
      type: String, 
      enum: ["individual", "school", "global"], 
      default: "individual" 
    },
    requirements: {
      quizzesCompleted: { type: Number, default: 0 },
      tasksCompleted: { type: Number, default: 0 },
      pointsEarned: { type: Number, default: 0 }
    },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Challenge", challengeSchema);