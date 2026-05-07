const mongoose = require("mongoose");

const scheduledContentSchema = new mongoose.Schema(
  {
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    school: { type: String, default: "" },
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: "School", default: null },
    type: { type: String, enum: ["quiz", "task"], required: true },
    contentId: { type: mongoose.Schema.Types.ObjectId, default: null },
    title: { type: String, required: true, trim: true },
    visibility: { type: String, enum: ["students", "teachers"], default: "students" },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ScheduledContent", scheduledContentSchema);
