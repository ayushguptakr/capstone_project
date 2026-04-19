const User = require("../models/User");
const XPEvent = require("../models/XPEvent");
const Submission = require("../models/Submission");

async function evaluateBadges(user) {
  if (!Array.isArray(user.badges)) user.badges = [];
  
  const missionsDone = await Submission.countDocuments({
    student: user._id,
    status: "approved"
  });

  if (missionsDone >= 5 && !user.badges.includes("TREE_HUGGER")) {
    user.badges.push("TREE_HUGGER");
  }

  const xp = user.experiencePoints || user.points;
  if (xp >= 500 && !user.badges.includes("ECO_SCHOLAR")) {
    user.badges.push("ECO_SCHOLAR");
  }

  if (user.streakCurrent >= 7 && !user.badges.includes("ON_FIRE")) {
    user.badges.push("ON_FIRE");
  }

  const higherRankUsers = await User.countDocuments({
    role: { $in: ["student", "sponsor"] },
    points: { $gt: user.points }
  });
  const rank = higherRankUsers + 1;
  
  if (rank <= 3 && user.points > 0 && !user.badges.includes("TOP_STAR")) {
    user.badges.push("TOP_STAR");
  }
}

function startOfDay(dateValue) {
  const d = new Date(dateValue || Date.now());
  d.setHours(0, 0, 0, 0);
  return d;
}

function daysBetween(a, b) {
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.round((startOfDay(b).getTime() - startOfDay(a).getTime()) / msPerDay);
}

function applyPlantDecay(user) {
  const today = startOfDay(new Date());
  const last = startOfDay(user.plantLastDecayedAt || user.createdAt || new Date());

  const daysPassed = daysBetween(last, today);
  if (daysPassed <= 0) return user;

  const decayDays = Math.min(daysPassed, 3);
  const decayAmount = decayDays * 8; // -8 per day

  user.plantHealth = Math.max(0, (user.plantHealth ?? 100) - decayAmount);
  user.plantLastDecayedAt = today;
  return user;
}

function applyPlantRecovery(user, type) {
  const today = startOfDay(new Date());
  
  // Reset daily gained tracker if it's a new day
  const lastGained = startOfDay(user.plantLastGainedAt || new Date(0));
  if (daysBetween(lastGained, today) > 0) {
    user.plantHealthGainedToday = 0;
  }

  const recoveryMap = {
    quiz: 10,
    game: 10,
    task: 18,
    mission: 18,
  };

  const gain = recoveryMap[type] || 10;
  const currentDailyGained = user.plantHealthGainedToday || 0;
  const maxPossibleGain = Math.max(0, 25 - currentDailyGained);
  
  const actualGain = Math.min(gain, maxPossibleGain);
  if (actualGain > 0) {
    user.plantHealth = Math.min(100, (user.plantHealth ?? 100) + actualGain);
    user.plantHealthGainedToday = currentDailyGained + actualGain;
    user.plantLastGainedAt = today;
  }
  return user;
}

function levelFromPoints(points) {
  const p = Number(points || 0);
  return Math.max(1, Math.floor(p / 100) + 1);
}

function applyStreak(user, activityDate = new Date()) {
  const activityDay = startOfDay(activityDate);
  if (!user.streakLastActiveAt) {
    user.streakCurrent = 1;
    user.streakLastActiveAt = activityDay;
    return;
  }

  const delta = daysBetween(user.streakLastActiveAt, activityDay);
  if (delta === 0) return;
  if (delta === 1) {
    user.streakCurrent = Number(user.streakCurrent || 0) + 1;
    user.streakLastActiveAt = activityDay;
    return;
  }

  // Check if streak freeze is active — forgive the gap
  const isFrozen = user.streakFreezeUntil && new Date(user.streakFreezeUntil) >= activityDay;
  if (isFrozen && delta <= 2) {
    // Freeze used — continue streak as if no gap
    user.streakCurrent = Number(user.streakCurrent || 0) + 1;
    user.streakLastActiveAt = activityDay;
    user.streakFreezeUntil = null; // Consume the freeze
    return;
  }

  // Streak broken
  user.streakCurrent = 1;
  user.streakLastActiveAt = activityDay;
}

async function awardPoints({
  userId,
  points,
  source,
  sourceRef = "",
  metadata = {},
  idempotencyKey,
  activityDate = new Date(),
}) {
  const pts = Number(points || 0);
  if (!userId) throw new Error("userId is required");

  if (idempotencyKey) {
    const existing = await XPEvent.findOne({ idempotencyKey }).lean();
    if (existing) {
      const user = await User.findById(userId).lean();
      return { alreadyProcessed: true, event: existing, user };
    }
  }

  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  applyPlantDecay(user);
  if (pts > 0 && source) {
    applyPlantRecovery(user, source);
  }

  user.points = Number(user.points || 0) + pts;
  user.experiencePoints = Number(user.experiencePoints || 0) + pts;
  user.weeklyXP = Number(user.weeklyXP || 0) + pts;
  user.level = levelFromPoints(user.points);
  user.lastActivityAt = new Date(activityDate);
  applyStreak(user, activityDate);

  await evaluateBadges(user);

  await user.save();

  const event = await XPEvent.create({
    user: userId,
    source,
    sourceRef,
    points: pts,
    metadata,
    occurredAt: new Date(activityDate),
    idempotencyKey,
  });

  return { alreadyProcessed: false, event, user: user.toObject() };
}

async function syncActivity({ userId, activityDate = new Date() }) {
  if (!userId) throw new Error("userId is required");
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");
  
  applyPlantDecay(user);
  
  user.lastActivityAt = new Date(activityDate);
  applyStreak(user, activityDate);
  if (!user.level || user.level < 1) {
    user.level = levelFromPoints(Number(user.points || 0));
  }
  await user.save();
  return user.toObject();
}

module.exports = {
  awardPoints,
  syncActivity,
  levelFromPoints,
  applyPlantDecay,
  applyPlantRecovery,
  evaluateBadges
};
