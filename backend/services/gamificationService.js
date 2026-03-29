const User = require("../models/User");
const XPEvent = require("../models/XPEvent");

function startOfDay(dateValue) {
  const d = new Date(dateValue || Date.now());
  d.setHours(0, 0, 0, 0);
  return d;
}

function daysBetween(a, b) {
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.round((startOfDay(b).getTime() - startOfDay(a).getTime()) / msPerDay);
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

  user.points = Number(user.points || 0) + pts;
  user.experiencePoints = Number(user.experiencePoints || 0) + pts;
  user.level = levelFromPoints(user.points);
  user.lastActivityAt = new Date(activityDate);
  applyStreak(user, activityDate);
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
};
