/**
 * Hybrid AI + Teacher Verification Layer
 * Computes submission_trust_score (0–100) using duplicate image, timestamp, geo checks.
 */
const Submission = require("../models/Submission");
const TrustScore = require("../models/TrustScore");

const TRUST_THRESHOLD = 60; // below this => flag for manual review
const TIMESTAMP_TOLERANCE_MS = 24 * 60 * 60 * 1000; // 24h

/**
 * Check if image hash is duplicate (same hash in another submission by same student).
 */
async function isDuplicateImage(imageHash, studentId, excludeSubmissionId = null) {
  if (!imageHash) return false;
  const q = { imageHash, student: studentId };
  if (excludeSubmissionId) q._id = { $ne: excludeSubmissionId };
  const count = await Submission.countDocuments(q);
  return count > 0;
}

/**
 * Timestamp anomaly: submittedAt too far from now (future or very old).
 */
function hasTimestampAnomaly(submittedAt) {
  if (!submittedAt) return false;
  const t = new Date(submittedAt).getTime();
  const now = Date.now();
  if (t > now + TIMESTAMP_TOLERANCE_MS) return true;
  if (now - t > 7 * 24 * 60 * 60 * 1000) return true; // older than 7 days
  return false;
}

/**
 * Geo validation: if geo required (e.g. campaign setting), check presence/validity.
 * For now we only check if geo is present when we want it; no strict radius check.
 */
function geoValidationFailed(geoTag, requireGeo = false) {
  if (!requireGeo) return false;
  if (!geoTag || typeof geoTag.lat !== "number" || typeof geoTag.lng !== "number") return true;
  if (geoTag.lat < -90 || geoTag.lat > 90 || geoTag.lng < -180 || geoTag.lng > 180) return true;
  return false;
}

/**
 * Compute trust score 0–100 and details.
 * @param {Object} submission - { imageHash, submittedAt, geoTag }
 * @param {string} studentId
 * @param {boolean} requireGeo
 */
async function computeTrustScore(submission, studentId, requireGeo = false) {
  let score = 100;
  const details = { duplicateImage: false, timestampAnomaly: false, geoValidationFailed: false };

  const duplicateImage = await isDuplicateImage(
    submission.imageHash,
    studentId,
    submission._id
  );
  if (duplicateImage) {
    score -= 40;
    details.duplicateImage = true;
  }

  const timestampAnomaly = hasTimestampAnomaly(submission.submittedAt);
  if (timestampAnomaly) {
    score -= 30;
    details.timestampAnomaly = true;
  }

  const geoFailed = geoValidationFailed(submission.geoTag, requireGeo);
  if (geoFailed) {
    score -= 20;
    details.geoValidationFailed = true;
  }

  const finalScore = Math.max(0, Math.min(100, score));

  return {
    score: finalScore,
    duplicateImage,
    timestampAnomaly,
    geoValidationFailed: geoFailed,
    details,
    flagForReview: finalScore < TRUST_THRESHOLD,
  };
}

/**
 * Apply trust score to submission and optionally persist TrustScore record.
 */
async function applyTrustScoreToSubmission(submissionId, result) {
  await Submission.findByIdAndUpdate(submissionId, {
    submission_trust_score: result.score,
    flagForReview: result.flagForReview,
  });
  await TrustScore.findOneAndUpdate(
    { submission: submissionId },
    {
      submission: submissionId,
      score: result.score,
      duplicateImage: result.duplicateImage,
      timestampAnomaly: result.timestampAnomaly,
      geoValidationFailed: result.geoValidationFailed,
      details: result.details,
    },
    { upsert: true }
  );
}

function getTrustThreshold() {
  return TRUST_THRESHOLD;
}

module.exports = {
  computeTrustScore,
  applyTrustScoreToSubmission,
  isDuplicateImage,
  hasTimestampAnomaly,
  geoValidationFailed,
  getTrustThreshold,
};
