const mongoose = require("mongoose");

/**
 * Impact model: configurable coefficients to convert task completion into
 * measurable environmental impact metrics (per unit of action).
 */
const impactModelSchema = new mongoose.Schema(
  {
    co2_per_unit: { type: Number, default: 0 },   // kg CO₂ equivalent reduced per unit
    water_per_unit: { type: Number, default: 0 }, // liters saved per unit
    waste_per_unit: { type: Number, default: 0 },  // kg waste diverted per unit
    energy_per_unit: { type: Number, default: 0 }, // kWh saved per unit
    impact_weight: { type: Number, default: 1 },   // relative weight for PSI
    unit_label: { type: String, default: "completion" },
  },
  { _id: false }
);

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    points: { type: Number, default: 10 },
    deadline: { type: Date },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    /** Eco-impact: optional. If missing, regional/default coefficients can be used. */
    impact_model: impactModelSchema,
    /** Category for analytics and recommendations (e.g. water, waste, energy, biodiversity). */
    category: { type: String, default: "general" },
    /** Difficulty 1-5; used in ranking and PSI difficulty weight. */
    difficulty: { type: Number, default: 1, min: 1, max: 5 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Task", taskSchema);
