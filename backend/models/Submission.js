const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema(
  {
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      required: true
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    content: { type: String },
    imageUrl: { type: String },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending"
    },

    feedback: { type: String },
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    verifiedAt: { type: Date },
    pointsAwarded: { type: Number, default: 0 }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Submission", submissionSchema);
