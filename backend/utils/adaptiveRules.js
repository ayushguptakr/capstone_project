/**
 * Pure decision rules for the Adaptive Eco‑Game Difficulty Engine.
 * Kept DB-free for unit testing and auditability.
 */

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

/**
 * Compute adaptive tuning knobs from signals.
 * @param {Object} signals
 * @param {number} signals.accuracy 0..1
 * @param {number} signals.avgTimePerQuestionSec >=0
 * @param {number} signals.retryCount >=0
 */
function computeAdaptiveTuning({ accuracy = 0.5, avgTimePerQuestionSec = 0, retryCount = 0 }) {
  const acc = clamp(Number(accuracy) || 0.5, 0, 1);
  const t = Math.max(0, Number(avgTimePerQuestionSec) || 0);
  const r = Math.max(0, Number(retryCount) || 0);

  let recommendedDifficulty = "medium";
  if (acc < 0.55 || t > 25) recommendedDifficulty = "easy";
  else if (acc > 0.8 && t < 18) recommendedDifficulty = "hard";

  const hintLevel = acc < 0.55 ? 2 : acc < 0.75 ? 1 : 0;

  let rewardMultiplier = 1.0;
  if (acc < 0.55) rewardMultiplier = 1.25;
  else if (acc < 0.75) rewardMultiplier = 1.1;
  else if (acc > 0.9) rewardMultiplier = 0.95;
  rewardMultiplier = clamp(rewardMultiplier - clamp(r * 0.01, 0, 0.1), 0.8, 1.5);

  const penaltyWeight = clamp(1 - 0.3 * hintLevel, 0.4, 1);

  let taskComplexity = 3;
  if (recommendedDifficulty === "easy") taskComplexity = 2;
  if (recommendedDifficulty === "hard") taskComplexity = 4;

  return { recommendedDifficulty, hintLevel, rewardMultiplier, penaltyWeight, taskComplexity };
}

module.exports = { computeAdaptiveTuning };

