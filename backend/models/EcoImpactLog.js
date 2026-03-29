const mongoose = require("mongoose");

/**
 * Stores computed environmental impact per approved submission/task completion.
 * Used for PSI, analytics, and leaderboard aggregation.
 */
const ecoImpactLogSchema = new mongoose.Schema(
  {
    submission: { type: mongoose.Schema.Types.ObjectId, ref: "Submission", required: true },
    task: { type: mongoose.Schema.Types.ObjectId, ref: "Task", required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    school: { type: String },
    className: { type: String },

    /** Quantified impact (per unit × quantity; quantity default 1). */
    co2Reduced: { type: Number, default: 0 },
    waterSaved: { type: Number, default: 0 },
    wasteDiverted: { type: Number, default: 0 },
    energySaved: { type: Number, default: 0 },

    /** Single composite for ranking: Impact Value × Consistency × Difficulty. */
    impactValue: { type: Number, default: 0 },
    /** PSI contribution for this action. */
    psiContribution: { type: Number, default: 0 },

    /** Multipliers used at computation time. */
    consistencyMultiplier: { type: Number, default: 1 },
    difficultyWeight: { type: Number, default: 1 },
    quantity: { type: Number, default: 1 },

    /** Optional: link to sponsor campaign for campaign-level aggregation. */
    campaignId: { type: mongoose.Schema.Types.ObjectId },
  },
  { timestamps: true }
);

ecoImpactLogSchema.index({ student: 1, createdAt: -1 });
ecoImpactLogSchema.index({ school: 1, createdAt: -1 });
ecoImpactLogSchema.index({ task: 1 });
ecoImpactLogSchema.index({ campaignId: 1 });

module.exports = mongoose.model("EcoImpactLog", ecoImpactLogSchema);
