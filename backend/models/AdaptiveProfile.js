const mongoose = require("mongoose");

/**
 * Per-student adaptive learning/gamification profile.
 * Stores rolling performance signals and allows computing dynamic difficulty adjustments.
 */
const categoryStatsSchema = new mongoose.Schema(
  {
    attempts: { type: Number, default: 0 },
    correct: { type: Number, default: 0 },
    totalQuestions: { type: Number, default: 0 },
    avgTimePerQuestionSec: { type: Number, default: 0 },
    /** Consecutive incorrect answers trend proxy. */
    mistakeStreak: { type: Number, default: 0 },
    /** Recent most-missed question indices (pattern proxy). */
    recentMistakeIndices: [{ type: Number }],

    gamePlays: { type: Number, default: 0 },
    gameRetries: { type: Number, default: 0 },
    lastUpdatedAt: { type: Date },
  },
  { _id: false }
);

const adaptiveProfileSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    /** Keyed by category (water, energy, climate, etc.). */
    categories: {
      type: Map,
      of: categoryStatsSchema,
      default: {},
    },
    /** Cached last computed adjustments (for UI). */
    lastAdjustments: { type: mongoose.Schema.Types.Mixed },
    computedAt: { type: Date },
  },
  { timestamps: true }
);

adaptiveProfileSchema.index({ student: 1 }, { unique: true });

module.exports = mongoose.model("AdaptiveProfile", adaptiveProfileSchema);

