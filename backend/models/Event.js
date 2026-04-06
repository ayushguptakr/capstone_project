const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    durationDays: { type: Number, default: 7 },
    type: { type: String, enum: ["quiz", "task", "mixed"], default: "mixed" },
    scope: { type: String, enum: ["class", "school-wide"], default: "school-wide" },
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: "School" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    participantClasses: [{ type: String }],
    status: { type: String, enum: ["active", "completed", "upcoming"], default: "active" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Event", eventSchema);
