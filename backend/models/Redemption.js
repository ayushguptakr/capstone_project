const mongoose = require("mongoose");

const redemptionSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    reward: { type: mongoose.Schema.Types.ObjectId, ref: "Reward", required: true },
    pointsSpent: { type: Number, required: true },
    status: { 
      type: String, 
      enum: ["pending", "approved", "delivered", "cancelled"], 
      default: "pending" 
    },
    deliveryAddress: { type: String },
    notes: { type: String }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Redemption", redemptionSchema);