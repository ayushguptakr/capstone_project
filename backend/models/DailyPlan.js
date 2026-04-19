const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  taskId: { type: String, required: true },
  task: { type: String, required: true },
  impact: { type: String, required: true }, // "+10 XP"
  type: { type: String, required: true }, // "water", "waste", "energy", "habit"
  verificationType: { type: String, required: true } // "quick", "proof", "quiz"
}, { _id: false });

const dailyPlanSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  dateKey: { type: String, required: true }, // "YYYY-MM-DD" formatted local date
  tasks: [taskSchema]
}, { timestamps: true });

// Ensure only one plan per user per day
dailyPlanSchema.index({ user: 1, dateKey: 1 }, { unique: true });

module.exports = mongoose.model("DailyPlan", dailyPlanSchema);
