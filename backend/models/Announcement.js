const mongoose = require("mongoose");

const announcementSchema = new mongoose.Schema(
  {
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    school: { type: String, default: "" },
    target: { type: String, default: "All Classes" },
    message: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Announcement", announcementSchema);
