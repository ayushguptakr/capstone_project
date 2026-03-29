/**
 * Unit tests for eco-impact and sustainability formulas.
 * Run with: node tests/formulas.test.js (or npm test if Jest configured)
 */
const assert = require("assert");
const {
  computePSIContribution,
  timeRecencyFactor,
  difficultyWeight,
  schoolPopulationNormalizer,
  adjustedSustainabilityScore,
  compositeImpactValue,
  impactToGreenCredits,
} = require("../utils/formulas");

function test(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
  } catch (e) {
    console.error(`  ✗ ${name}: ${e.message}`);
    throw e;
  }
}

console.log("Formulas");
test("computePSIContribution: impact * consistency * difficulty", () => {
  const r = computePSIContribution(10, 1, 1.2);
  assert.strictEqual(r, 12);
});

test("timeRecencyFactor: recent date near 1", () => {
  const r = timeRecencyFactor(new Date());
  assert.ok(r > 0.9 && r <= 1);
});

test("timeRecencyFactor: old date < 1", () => {
  const d = new Date();
  d.setDate(d.getDate() - 60);
  const r = timeRecencyFactor(d);
  assert.ok(r < 0.5 && r > 0);
});

test("difficultyWeight: 1->0.6, 5->1.4", () => {
  assert.strictEqual(difficultyWeight(1), 0.6);
  assert.strictEqual(difficultyWeight(5), 1.4);
});

test("schoolPopulationNormalizer: increases with size", () => {
  const n1 = schoolPopulationNormalizer(10);
  const n2 = schoolPopulationNormalizer(1000);
  assert.ok(n2 > n1);
});

test("adjustedSustainabilityScore: formula", () => {
  const r = adjustedSustainabilityScore(100, 1, 1, 2);
  assert.strictEqual(r, 50);
});

test("compositeImpactValue: non-negative", () => {
  const r = compositeImpactValue(1, 10, 0.5, 5, 1);
  assert.ok(r >= 0);
});

test("impactToGreenCredits: positive for positive impact", () => {
  const r = impactToGreenCredits(10, 100, 1, 5);
  assert.ok(r > 0);
});

console.log("Formulas tests done.\n");
