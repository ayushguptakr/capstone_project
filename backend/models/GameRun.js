const mongoose = require("mongoose");

/**
 * Anti-replay record for mini-game runs.
 * A run is created on /start-run and must be consumed exactly once on /submit-score.
 */
const gameRunSchema = new mongoose.Schema(
  {
    runId: { type: String, required: true, unique: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    game: { type: mongoose.Schema.Types.ObjectId, ref: "MiniGame", required: true },
    level: { type: Number, default: 1 },
    createdAt: { type: Date, default: Date.now },
    consumedAt: { type: Date, default: null },
  },
  { timestamps: false }
);

gameRunSchema.index({ student: 1, createdAt: -1 });

module.exports = mongoose.model("GameRun", gameRunSchema);

