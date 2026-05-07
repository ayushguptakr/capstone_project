const mongoose = require("mongoose");

const xpEventSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    source: {
      type: String,
      enum: ["quiz", "game", "task", "bonus", "system"],
      required: true,
    },
    sourceRef: { type: String, default: "" },
    points: { type: Number, required: true },
    metadata: { type: Object, default: {} },
    occurredAt: { type: Date, default: Date.now },
    idempotencyKey: { type: String, unique: true, sparse: true },
  },
  { timestamps: true }
);

// Query-performance indexes for gamification summaries and cap checks
xpEventSchema.index({ user: 1, occurredAt: -1 });
xpEventSchema.index({ user: 1, source: 1, occurredAt: -1 });
xpEventSchema.index({ user: 1, source: 1, sourceRef: 1, occurredAt: -1 });

module.exports = mongoose.model("XPEvent", xpEventSchema);
