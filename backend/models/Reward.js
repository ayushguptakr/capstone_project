const mongoose = require("mongoose");

const rewardSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    pointsCost: { type: Number, required: true },
    category: { 
      type: String, 
      enum: ["eco-products", "certificates", "vouchers", "merchandise"], 
      default: "eco-products" 
    },
    image: { type: String },
    stock: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Reward", rewardSchema);