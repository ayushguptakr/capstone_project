// Central progression config (single source of truth)

const XP_PER_LEVEL = Number(process.env.XP_PER_LEVEL || 100);

function levelFromPoints(points) {
  const p = Number(points || 0);
  return Math.max(1, Math.floor(p / XP_PER_LEVEL) + 1);
}

function nextLevelPointsForLevel(level) {
  const lvl = Math.max(1, Number(level || 1));
  return lvl * XP_PER_LEVEL;
}

function pointsToNextLevel(points) {
  const p = Number(points || 0);
  const lvl = levelFromPoints(p);
  const next = nextLevelPointsForLevel(lvl);
  return Math.max(0, next - p);
}

module.exports = {
  XP_PER_LEVEL,
  levelFromPoints,
  nextLevelPointsForLevel,
  pointsToNextLevel,
};

