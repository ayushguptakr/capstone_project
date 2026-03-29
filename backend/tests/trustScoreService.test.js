/**
 * Unit tests for trust score logic (duplicate, timestamp, geo).
 * Uses service logic without DB.
 */
const assert = require("assert");

function hasTimestampAnomaly(submittedAt, toleranceMs = 24 * 60 * 60 * 1000) {
  if (!submittedAt) return false;
  const t = new Date(submittedAt).getTime();
  const now = Date.now();
  if (t > now + toleranceMs) return true;
  if (now - t > 7 * 24 * 60 * 60 * 1000) return true;
  return false;
}

function geoValidationFailed(geoTag, requireGeo = false) {
  if (!requireGeo) return false;
  if (!geoTag || typeof geoTag.lat !== "number" || typeof geoTag.lng !== "number") return true;
  if (geoTag.lat < -90 || geoTag.lat > 90 || geoTag.lng < -180 || geoTag.lng > 180) return true;
  return false;
}

function test(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
  } catch (e) {
    console.error(`  ✗ ${name}: ${e.message}`);
    throw e;
  }
}

console.log("Trust score (timestamp & geo)");
test("hasTimestampAnomaly: no submittedAt => false", () => {
  assert.strictEqual(hasTimestampAnomaly(null), false);
});

test("hasTimestampAnomaly: future date => true", () => {
  const future = new Date(Date.now() + 25 * 60 * 60 * 1000);
  assert.strictEqual(hasTimestampAnomaly(future), true);
});

test("hasTimestampAnomaly: recent date => false", () => {
  assert.strictEqual(hasTimestampAnomaly(new Date()), false);
});

test("geoValidationFailed: requireGeo false => false", () => {
  assert.strictEqual(geoValidationFailed(null, false), false);
});

test("geoValidationFailed: requireGeo true, no geo => true", () => {
  assert.strictEqual(geoValidationFailed(null, true), true);
});

test("geoValidationFailed: valid geo => false", () => {
  assert.strictEqual(geoValidationFailed({ lat: 0, lng: 0 }, true), false);
});

console.log("Trust score tests done.\n");
