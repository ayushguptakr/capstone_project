const mongoose = require("mongoose");

const customBadgeSchema = new mongoose.Schema(
  {
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    school: { type: String, default: "" },
    title: { type: String, required: true, trim: true },
    icon: { type: String, default: "🌟" },
    criteria: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CustomBadge", customBadgeSchema);
