const mongoose = require("mongoose");

const missionClaimSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  taskId: { type: String, required: true }, // Should match the generated ID in DailyPlan
  dateKey: { type: String, required: true },
  
  status: {
    type: String,
    enum: ["pending", "verified", "rejected"],
    default: "verified" // currently auto-verifying based on modal flow, but extensible later
  },
  
  verificationType: {
    type: String,
    enum: ["quick", "proof", "quiz"],
    required: true
  },
  
  proofData: { type: String }, // User input text, or Base64 dummy, or exact quiz answer
  
  awardedXP: { type: Number, default: 0 }
}, { timestamps: true });

// A user can only have one claim per specific task ID per day.
missionClaimSchema.index({ user: 1, taskId: 1, dateKey: 1 }, { unique: true });

module.exports = mongoose.model("MissionClaim", missionClaimSchema);
