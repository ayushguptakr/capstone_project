const RegionalImpactCoefficient = require("../models/RegionalImpactCoefficient");

async function getDefault() {
  return RegionalImpactCoefficient.findOne({ region: "", category: "", isActive: true }).lean();
}

async function getForRegionAndCategory(region, category) {
  const r = await RegionalImpactCoefficient.findOne({
    region: region || "",
    category: category || "",
    isActive: true,
  }).lean();
  if (r) return r;
  return getDefault();
}

async function upsertDefault(coefficients) {
  return RegionalImpactCoefficient.findOneAndUpdate(
    { region: "", category: "" },
    { $set: { ...coefficients, isActive: true } },
    { upsert: true, new: true }
  );
}

module.exports = {
  getDefault,
  getForRegionAndCategory,
  upsertDefault,
};
