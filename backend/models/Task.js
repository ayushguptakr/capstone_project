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
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: "School", default: null },
    isGlobal: { type: Boolean, default: false },
    /** Context for students on why the mission helps the planet. */
    whyItMatters: { type: String, default: "This mission helps protect our local ecosystem!" },
    /** Determines if the student must upload an image, video, text, or any variation. */
    proofType: { type: String, enum: ["image", "video", "text", "any"], default: "any" },
    /** If set, only students in this specific class/section can view/start the mission. */
    targetClass: { type: String, default: null },
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
