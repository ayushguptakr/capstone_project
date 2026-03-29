const assert = require("assert");
const { computeAdaptiveTuning } = require("../utils/adaptiveRules");

function test(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
  } catch (e) {
    console.error(`  ✗ ${name}: ${e.message}`);
    throw e;
  }
}

console.log("Adaptive rules");

test("weak accuracy => easy + more hints + higher multiplier", () => {
  const r = computeAdaptiveTuning({ accuracy: 0.4, avgTimePerQuestionSec: 10, retryCount: 0 });
  assert.strictEqual(r.recommendedDifficulty, "easy");
  assert.strictEqual(r.hintLevel, 2);
  assert.ok(r.rewardMultiplier > 1);
  assert.ok(r.penaltyWeight < 1);
});

test("strong accuracy + fast => hard + no hints", () => {
  const r = computeAdaptiveTuning({ accuracy: 0.9, avgTimePerQuestionSec: 12, retryCount: 0 });
  assert.strictEqual(r.recommendedDifficulty, "hard");
  assert.strictEqual(r.hintLevel, 0);
});

test("retries reduce multiplier slightly", () => {
  const a = computeAdaptiveTuning({ accuracy: 0.6, avgTimePerQuestionSec: 15, retryCount: 0 });
  const b = computeAdaptiveTuning({ accuracy: 0.6, avgTimePerQuestionSec: 15, retryCount: 10 });
  assert.ok(b.rewardMultiplier < a.rewardMultiplier);
});

console.log("Adaptive rules tests done.\n");

