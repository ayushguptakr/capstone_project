const mongoose = require("mongoose");

/**
 * Default or region-specific impact coefficients when task has no impact_model.
 * Match by region/school/category for localized conversion.
 */
const regionalImpactCoefficientSchema = new mongoose.Schema(
  {
    /** Optional: region/school name; empty = global default. */
    region: { type: String, default: "" },
    /** Optional: category (water, waste, energy, etc.); empty = default for category. */
    category: { type: String, default: "" },

    co2_per_unit: { type: Number, default: 0 },
    water_per_unit: { type: Number, default: 0 },
    waste_per_unit: { type: Number, default: 0 },
    energy_per_unit: { type: Number, default: 0 },
    impact_weight: { type: Number, default: 1 },
    unit_label: { type: String, default: "completion" },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

regionalImpactCoefficientSchema.index({ region: 1, category: 1 });

module.exports = mongoose.model("RegionalImpactCoefficient", regionalImpactCoefficientSchema);
