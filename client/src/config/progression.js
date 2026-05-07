// Frontend progression config (kept in sync with backend/config/progression.js)

export const XP_PER_LEVEL = Number(process.env.REACT_APP_XP_PER_LEVEL || 100);

export function levelFromPoints(points) {
  const p = Number(points || 0);
  return Math.max(1, Math.floor(p / XP_PER_LEVEL) + 1);
}

export function nextLevelPointsForLevel(level) {
  const lvl = Math.max(1, Number(level || 1));
  return lvl * XP_PER_LEVEL;
}

export function pointsToNextLevel(points) {
  const p = Number(points || 0);
  const lvl = levelFromPoints(p);
  const next = nextLevelPointsForLevel(lvl);
  return Math.max(0, next - p);
}

