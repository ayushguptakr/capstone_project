const mongoose = require("mongoose");

const featureToggleSchema = new mongoose.Schema(
  {
    competitions: { type: Boolean, default: true },
    rewards: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("FeatureToggle", featureToggleSchema);
