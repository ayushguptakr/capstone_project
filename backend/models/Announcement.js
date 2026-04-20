const mongoose = require("mongoose");

const announcementSchema = new mongoose.Schema(
  {
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: "School", default: null },
    school: { type: String, default: "" },
    target: { type: String, default: "All Classes" },
    message: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Announcement", announcementSchema);
