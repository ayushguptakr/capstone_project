/**
 * Adaptive Eco‑Game Difficulty Engine
 *
 * Tracks behavioral learning signals:
 * - Quiz accuracy, time per question, mistake patterns, category weakness
 * - Mini‑game retry frequency
 *
 * Produces adaptive outputs:
 * - Recommended quiz/game difficulty (easy/medium/hard)
 * - Hint availability level
 * - Reward multiplier
 * - Penalty weight
 * - Eco‑task complexity target (1–5)
 */

const AdaptiveProfile = require("../models/AdaptiveProfile");
const Quiz = require("../models/Quiz");
const { MiniGame, GameScore } = require("../models/MiniGame");
const { computeAdaptiveTuning } = require("../utils/adaptiveRules");

const CATEGORIES = ["waste-management", "energy", "water", "biodiversity", "climate"];
const DIFFICULTIES = ["easy", "medium", "hard"];

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function getCategoryKey(category) {
  if (!category) return "general";
  return String(category);
}

function safeAvg(values) {
  const nums = (values || []).map((v) => Number(v)).filter((v) => Number.isFinite(v) && v >= 0);
  if (nums.length === 0) return null;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

async function getOrCreateProfile(studentId) {
  let profile = await AdaptiveProfile.findOne({ student: studentId });
  if (!profile) profile = await AdaptiveProfile.create({ student: studentId });
  return profile;
}

function mergeRecentMistakes(existing = [], newMistakes = []) {
  const merged = [...newMistakes, ...existing].slice(0, 10);
  return merged;
}

/**
 * Update adaptive profile from a quiz attempt.
 * @param {string} studentId
 * @param {Object} quizDoc Quiz (must include category/difficulty and questions length)
 * @param {Array} processedAnswers array from QuizAttempt.answers
 * @param {Array<number>} timeTakenPerQuestionSec optional
 */
async function updateFromQuizAttempt(studentId, quizDoc, processedAnswers, timeTakenPerQuestionSec = []) {
  const profile = await getOrCreateProfile(studentId);
  const category = getCategoryKey(quizDoc.category);

  const stats = profile.categories.get(category) || {};

  const totalQuestions = processedAnswers.length;
  const correct = processedAnswers.filter((a) => a.isCorrect).length;
  const accuracy = totalQuestions > 0 ? correct / totalQuestions : 0;
  const avgTime = safeAvg(timeTakenPerQuestionSec);

  const mistakeIndices = processedAnswers.filter((a) => !a.isCorrect).map((a) => a.questionIndex);
  const mistakeStreak = clamp(
    (stats.mistakeStreak || 0) + (accuracy < 0.6 ? 1 : -1),
    0,
    10
  );

  // Rolling average time per question.
  let avgTimePerQuestionSec = stats.avgTimePerQuestionSec || 0;
  if (avgTime != null) {
    const prevN = stats.attempts || 0;
    avgTimePerQuestionSec = prevN === 0 ? avgTime : (avgTimePerQuestionSec * prevN + avgTime) / (prevN + 1);
  }

  profile.categories.set(category, {
    attempts: (stats.attempts || 0) + 1,
    correct: (stats.correct || 0) + correct,
    totalQuestions: (stats.totalQuestions || 0) + totalQuestions,
    avgTimePerQuestionSec,
    mistakeStreak,
    recentMistakeIndices: mergeRecentMistakes(stats.recentMistakeIndices || [], mistakeIndices),
    gamePlays: stats.gamePlays || 0,
    gameRetries: stats.gameRetries || 0,
    lastUpdatedAt: new Date(),
  });

  await profile.save();
  return profile;
}

/**
 * Update adaptive profile from a mini-game score.
 * Retry frequency is approximated by checking how many scores exist for this student+game
 * in the last RETRY_WINDOW_DAYS.
 */
const RETRY_WINDOW_DAYS = 7;

async function updateFromGameScore(studentId, gameDoc, gameScoreDoc) {
  const profile = await getOrCreateProfile(studentId);
  const category = getCategoryKey(gameDoc.category);

  const stats = profile.categories.get(category) || {};

  const since = new Date();
  since.setDate(since.getDate() - RETRY_WINDOW_DAYS);

  const recentPlays = await GameScore.countDocuments({
    student: studentId,
    game: gameDoc._id,
    createdAt: { $gte: since },
  });
  const isRetry = recentPlays > 1;

  profile.categories.set(category, {
    attempts: stats.attempts || 0,
    correct: stats.correct || 0,
    totalQuestions: stats.totalQuestions || 0,
    avgTimePerQuestionSec: stats.avgTimePerQuestionSec || 0,
    mistakeStreak: stats.mistakeStreak || 0,
    recentMistakeIndices: stats.recentMistakeIndices || [],
    gamePlays: (stats.gamePlays || 0) + 1,
    gameRetries: (stats.gameRetries || 0) + (isRetry ? 1 : 0),
    lastUpdatedAt: new Date(),
  });

  await profile.save();
  return { profile, isRetry };
}

/**
 * Determine weakness score for category (lower accuracy, higher time, more mistakes, more retries).
 */
function categoryWeaknessScore(stats) {
  const totalQ = stats.totalQuestions || 0;
  const accuracy = totalQ > 0 ? (stats.correct || 0) / totalQ : 0.5;
  const time = stats.avgTimePerQuestionSec || 0;
  const streak = stats.mistakeStreak || 0;
  const retries = stats.gameRetries || 0;

  // Higher score => weaker.
  return (1 - accuracy) * 60 + clamp(time / 10, 0, 20) + streak * 2 + clamp(retries, 0, 10);
}

/**
 * Compute adaptive adjustments for a student and optional category focus.
 */
async function computeAdjustments(studentId, category = null) {
  const profile = await getOrCreateProfile(studentId);

  const entries = Array.from(profile.categories.entries());
  const normalized = entries.map(([cat, stats]) => ({ cat, stats, weakness: categoryWeaknessScore(stats) }));

  let focusCategory = category ? getCategoryKey(category) : null;
  if (!focusCategory) {
    normalized.sort((a, b) => b.weakness - a.weakness);
    focusCategory = normalized[0]?.cat || "general";
  }

  const stats = profile.categories.get(focusCategory) || {};
  const totalQ = stats.totalQuestions || 0;
  const accuracy = totalQ > 0 ? (stats.correct || 0) / totalQ : 0.5;
  const avgTime = stats.avgTimePerQuestionSec || 0;
  const retries = stats.gameRetries || 0;

  const tuning = computeAdaptiveTuning({
    accuracy,
    avgTimePerQuestionSec: avgTime,
    retryCount: retries,
  });

  const adjustments = {
    focusCategory,
    ...tuning,
    signals: {
      accuracy,
      avgTimePerQuestionSec: avgTime,
      mistakeStreak: stats.mistakeStreak || 0,
      recentMistakeIndices: stats.recentMistakeIndices || [],
      gameRetryCount: retries,
    },
  };

  profile.lastAdjustments = adjustments;
  profile.computedAt = new Date();
  await profile.save();

  return adjustments;
}

/**
 * Fetch adaptive quizzes by category + recommended difficulty.
 */
async function getAdaptiveQuizzes(studentId, category = null, limit = 10) {
  const adj = await computeAdjustments(studentId, category);
  const q = {
    isActive: true,
    ...(adj.focusCategory && adj.focusCategory !== "general" ? { category: adj.focusCategory } : {}),
    difficulty: adj.recommendedDifficulty,
  };

  const quizzes = await Quiz.find(q)
    .select("-questions.correctAnswer")
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  return { adjustments: adj, quizzes };
}

/**
 * Fetch adaptive mini-games by category + difficulty (or easier).
 * If user is weak, return easy; if medium, return medium; if hard, return hard.
 */
async function getAdaptiveMiniGames(studentId, category = null, limit = 10) {
  const adj = await computeAdjustments(studentId, category);
  const q = {
    isActive: true,
    ...(adj.focusCategory && adj.focusCategory !== "general" ? { category: adj.focusCategory } : {}),
    difficulty: adj.recommendedDifficulty,
  };
  const games = await MiniGame.find(q).sort({ createdAt: -1 }).limit(limit).lean();
  return { adjustments: adj, games };
}

module.exports = {
  updateFromQuizAttempt,
  updateFromGameScore,
  computeAdjustments,
  getAdaptiveQuizzes,
  getAdaptiveMiniGames,
};

