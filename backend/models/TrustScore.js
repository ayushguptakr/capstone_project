const mongoose = require("mongoose");

/**
 * Stores trust-related signals per submission (for audit and tuning).
 * submission_trust_score is on Submission; this is optional detailed log.
 */
const trustScoreSchema = new mongoose.Schema(
  {
    submission: { type: mongoose.Schema.Types.ObjectId, ref: "Submission", required: true },
    /** Final 0–100 score. */
    score: { type: Number, required: true },
    /** Duplicate image detected (same hash as another submission). */
    duplicateImage: { type: Boolean, default: false },
    /** Timestamp anomaly (e.g. submittedAt far from server received time). */
    timestampAnomaly: { type: Boolean, default: false },
    /** Geo validation failed (if geo required). */
    geoValidationFailed: { type: Boolean, default: false },
    /** Optional details for manual review. */
    details: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

trustScoreSchema.index({ submission: 1 }, { unique: true });

module.exports = mongoose.model("TrustScore", trustScoreSchema);
