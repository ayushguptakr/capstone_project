const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema(
  {
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: "School", default: null },
    content: { type: String },
    imageUrl: { type: String },
    fileMime: { type: String },
    fileSize: { type: Number },

    /** Client-reported submission time (for anomaly detection). */
    submittedAt: { type: Date },
    /** Perceptual hash of image for duplicate detection. */
    imageHash: { type: String },
    /** Optional geo: { lat, lng } for geo-tag validation. */
    geoTag: {
      lat: Number,
      lng: Number,
    },
    /** 0–100; computed before teacher verification. Below threshold => flag for manual review. */
    submission_trust_score: { type: Number },
    /** Set when trust_score < threshold; requires manual review. */
    flagForReview: { type: Boolean, default: false },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    attemptCount: { type: Number, default: 1 },
    feedbackHistory: [
      {
        message: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
        by: { type: String } // optional name payload
      }
    ],
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    verifiedAt: { type: Date },
    pointsAwarded: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Submission", submissionSchema);
