const mongoose = require("mongoose");

const rewardSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    pointsCost: { type: Number, required: true },
    category: {
      type: String,
      enum: [
        "avatars",
        "creatures",
        "badges",
        "power-ups",
        "eco-rewards",
        "mystery",
        // legacy categories kept for backward compat
        "eco-products",
        "certificates",
        "vouchers",
        "merchandise",
      ],
      default: "eco-rewards",
    },
    icon: { type: String, default: "Gift" },
    image: { type: String },
    stock: { type: Number, default: -1 }, // -1 = unlimited
    isActive: { type: Boolean, default: true },
    rarity: {
      type: String,
      enum: ["common", "rare", "epic", "legendary"],
      default: "common",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Reward", rewardSchema);