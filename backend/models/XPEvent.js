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

module.exports = mongoose.model("XPEvent", xpEventSchema);
