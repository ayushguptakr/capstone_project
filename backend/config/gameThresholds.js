const GAME_THRESHOLDS = {
  version: 1,

  "waste-sorting": {
    1: { thresholds: [50, 100, 150], maxScore: 200 },
    2: { thresholds: [80, 150, 200], maxScore: 300 },
    3: { thresholds: [120, 200, 300], maxScore: 400 },
    scoring: { base: 10, penalty: -5 },
  },

  "eco-memory": {
    1: { thresholds: [100, 150, 200], maxScore: 300 },
    2: { thresholds: [150, 250, 300], maxScore: 450 },
    3: { thresholds: [250, 350, 450], maxScore: 600 },
    scoring: { base: 20, timeBonus: 2 },
  },

  "climate-hero": {
    1: { thresholds: [80, 150, 300], maxScore: 500 },
    2: { thresholds: [120, 200, 400], maxScore: 600 },
    3: { thresholds: [200, 350, 500], maxScore: 800 },
    scoring: { goodItem: 15, badPenalty: -10 },
  },

  "eco-trivia-race": {
    1: { thresholds: [50, 100, 150], maxScore: 250 },
    2: { thresholds: [80, 150, 220], maxScore: 300 },
    3: { thresholds: [120, 200, 300], maxScore: 400 },
    scoring: { base: 10, timeMultiplier: 2, streakMultiplier: 5 },
  },

  "plant-growth": {
    1: { thresholds: [100, 200, 300], maxScore: 500 },
    2: { thresholds: [150, 250, 400], maxScore: 600 },
    3: { thresholds: [250, 350, 500], maxScore: 800 },
    scoring: { tick: 5, growth: 50, perfectGrowth: 100 },
  },

  "eco-habit": {
    1: { thresholds: [300, 400, 500], maxScore: 700 }, // 10 rounds
    2: { thresholds: [450, 600, 750], maxScore: 900 }, // 10 rounds + tighter timer
    3: { thresholds: [700, 900, 1100], maxScore: 1300 }, // 15 rounds
    scoring: { base: 10, timeMutliplier: 2, streakMultiplier: 10 },
  }
};

/**
 * Maps a score to a star rating (0-3) based on thresholds.
 * @param {number} score 
 * @param {Array<number>} thresholds - e.g. [100, 200, 300]
 * @returns {number} 0, 1, 2, or 3
 */
function calculateStars(score, thresholds) {
  if (!thresholds || thresholds.length !== 3) return 0;
  if (score >= thresholds[2]) return 3; // Mastery
  if (score >= thresholds[1]) return 2; // Good
  if (score >= thresholds[0]) return 1; // Unlocked next
  return 0;                             // Failed
}

/**
 * Play streak diffing
 * @param {Date} prevDate 
 * @param {Date} now 
 * @param {number} prev
 */
function updatePlayStreak(prevDate, now, prev) {
  if (!prevDate) return 1;
  const startOfDay = (d) => new Date(d.setHours(0, 0, 0, 0));
  const prevDateStart = startOfDay(new Date(prevDate));
  const nowDateStart = startOfDay(new Date(now));
  
  const diffTime = Math.abs(nowDateStart - prevDateStart);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)); 
  
  if (diffDays === 1) return (prev || 0) + 1; // continues
  if (diffDays === 0) return prev || 1;       // same day
  return 1;                                   // reset
}

module.exports = {
  GAME_THRESHOLDS,
  calculateStars,
  updatePlayStreak
};
