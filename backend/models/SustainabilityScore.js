const mongoose = require("mongoose");

/**
 * Cached adjusted sustainability score for ranking (student, class, or school level).
 * Formula: (Impact Score × Consistency Index × Time Recency Factor) / School Population Normalizer
 */
const sustainabilityScoreSchema = new mongoose.Schema(
  {
    /** studentId for student-level; null for class/school. */
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    school: { type: String, required: true },
    /** Class identifier for class-level ranking (e.g. "10-A"); null for student/school only. */
    className: { type: String },

    /** Raw impact score (sum of impact values in window). */
    impactScore: { type: Number, default: 0 },
    /** Consistency index (e.g. 0–1 based on participation regularity). */
    consistencyIndex: { type: Number, default: 1 },
    /** Time recency factor (recent actions weighted higher). */
    timeRecencyFactor: { type: Number, default: 1 },
    /** Normalizer for school size (small vs large schools). */
    populationNormalizer: { type: Number, default: 1 },
    /** Final adjusted score used for ranking. */
    adjustedScore: { type: Number, default: 0 },

    /** Snapshot of totals for display. */
    totalCo2Reduced: { type: Number, default: 0 },
    totalWaterSaved: { type: Number, default: 0 },
    totalWasteDiverted: { type: Number, default: 0 },
    totalEnergySaved: { type: Number, default: 0 },

    /** Score computed at; refresh periodically. */
    computedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

sustainabilityScoreSchema.index({ school: 1, className: 1, student: 1 }, { unique: true });
sustainabilityScoreSchema.index({ adjustedScore: -1 });

module.exports = mongoose.model("SustainabilityScore", sustainabilityScoreSchema);
