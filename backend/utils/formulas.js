/**
 * Eco-Impact and Sustainability Ranking Formulas
 * Documented for transparency and audit.
 */

/** Half-life in days for time decay; recent actions weigh more. */
const TIME_DECAY_HALFLIFE_DAYS = 30;

/**
 * Personal Sustainability Index (PSI)
 * PSI = Σ (Impact Value × Consistency Multiplier × Difficulty Weight)
 * Impact Value = composite from co2/water/waste/energy with impact_weight.
 */
function computePSIContribution(impactValue, consistencyMultiplier, difficultyWeight) {
  return impactValue * (consistencyMultiplier || 1) * (difficultyWeight || 1);
}

/**
 * Time recency factor: recent actions contribute more.
 * Uses exponential decay: factor = 0.5^(daysSinceAction / HALFLIFE)
 * @param {Date} actionDate
 * @returns {number} factor in (0, 1]
 */
function timeRecencyFactor(actionDate) {
  const now = new Date();
  const days = (now - new Date(actionDate)) / (24 * 60 * 60 * 1000);
  return Math.pow(0.5, Math.max(0, days) / TIME_DECAY_HALFLIFE_DAYS);
}

/**
 * Consistency multiplier: based on how regularly the user participates.
 * @param {number} participationFrequency 0-1 (e.g. tasks per week / expected)
 * @returns {number}
 */
function consistencyMultiplierFromFrequency(participationFrequency) {
  if (participationFrequency >= 1) return 1.25;
  if (participationFrequency >= 0.5) return 1;
  if (participationFrequency >= 0.25) return 0.8;
  return 0.6;
}

/**
 * Difficulty weight for task (1-5 scale -> multiplier).
 * @param {number} difficulty 1-5
 * @returns {number}
 */
function difficultyWeight(difficulty) {
  const d = Math.min(5, Math.max(1, Number(difficulty) || 1));
  return 0.6 + (d - 1) * 0.2; // 0.6, 0.8, 1.0, 1.2, 1.4
}

/**
 * School population normalizer: reduces advantage of very small schools.
 * normalized = 1 + log10(1 + studentCount) so small schools don't dominate.
 * @param {number} studentCount
 * @returns {number}
 */
function schoolPopulationNormalizer(studentCount) {
  const n = Math.max(1, studentCount);
  return 1 + Math.log10(1 + n);
}

/**
 * Adjusted Sustainability Score for ranking.
 * Adjusted Score = (Impact Score × Consistency Index × Time Recency Factor) / School Population Normalizer
 * Impact Score can be computed as weighted sum of recent impact values with time decay.
 */
function adjustedSustainabilityScore(impactScore, consistencyIndex, timeRecencyFactorVal, populationNormalizer) {
  const denom = Math.max(0.01, populationNormalizer);
  return (impactScore * (consistencyIndex || 1) * (timeRecencyFactorVal || 1)) / denom;
}

/**
 * Composite impact value from raw metrics (for single action).
 * Uses impact_weight from task/region and normalizes to a single number.
 */
function compositeImpactValue(co2, water, waste, energy, impactWeight = 1) {
  const normalized = (Number(co2) || 0) * 1 + (Number(water) || 0) * 0.01 + (Number(waste) || 0) * 2 + (Number(energy) || 0) * 0.1;
  return normalized * (Number(impactWeight) || 1);
}

/**
 * Green Credits: convert environmental impact to credits (e.g. 1 credit per 10 kg CO₂ equivalent).
 */
const GREEN_CREDITS_PER_CO2_KG = 0.1;
const GREEN_CREDITS_PER_WATER_L = 0.001;
const GREEN_CREDITS_PER_WASTE_KG = 0.2;
const GREEN_CREDITS_PER_ENERGY_KWH = 0.05;

function impactToGreenCredits(co2Reduced, waterSaved, wasteDiverted, energySaved) {
  return (
    (Number(co2Reduced) || 0) * GREEN_CREDITS_PER_CO2_KG +
    (Number(waterSaved) || 0) * GREEN_CREDITS_PER_WATER_L +
    (Number(wasteDiverted) || 0) * GREEN_CREDITS_PER_WASTE_KG +
    (Number(energySaved) || 0) * GREEN_CREDITS_PER_ENERGY_KWH
  );
}

module.exports = {
  TIME_DECAY_HALFLIFE_DAYS,
  computePSIContribution,
  timeRecencyFactor,
  consistencyMultiplierFromFrequency,
  difficultyWeight,
  schoolPopulationNormalizer,
  adjustedSustainabilityScore,
  compositeImpactValue,
  impactToGreenCredits,
  GREEN_CREDITS_PER_CO2_KG,
  GREEN_CREDITS_PER_WATER_L,
  GREEN_CREDITS_PER_WASTE_KG,
  GREEN_CREDITS_PER_ENERGY_KWH,
};
