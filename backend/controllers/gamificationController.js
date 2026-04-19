const User = require("../models/User");
const XPEvent = require("../models/XPEvent");
const { levelFromPoints, syncActivity, applyPlantDecay } = require("../services/gamificationService");

async function getMyGamification(req, res) {
  try {
    const limit = Math.max(1, Math.min(100, Number(req.query.limit || 20)));
    const offset = Math.max(0, Number(req.query.offset || 0));
    const sourceFilter = req.query.source ? String(req.query.source).trim() : "";

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Ensure plant state is accurately decayed on summary fetch
    applyPlantDecay(user);
    if (user.isModified("plantHealth") || user.isModified("plantLastDecayedAt")) {
      await user.save();
    }

    const currentPoints = Number(user.points || 0);
    const computedLevel = levelFromPoints(currentPoints);
    const nextLevelPoints = computedLevel * 100;
    const pointsToNextLevel = Math.max(0, nextLevelPoints - currentPoints);

    const eventQuery = { user: req.user.id };
    if (sourceFilter) eventQuery.source = sourceFilter;

    const totalEvents = await XPEvent.countDocuments(eventQuery);
    const recentEvents = await XPEvent.find(eventQuery)
      .sort({ occurredAt: -1, createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .lean();

    const totalsBySource = recentEvents.reduce(
      (acc, evt) => {
        const src = evt.source || "system";
        acc[src] = (acc[src] || 0) + Number(evt.points || 0);
        return acc;
      },
      { quiz: 0, game: 0, task: 0, bonus: 0, system: 0 }
    );

    res.json({
      summary: {
        points: currentPoints,
        level: Number(user.level || computedLevel),
        experiencePoints: Number(user.experiencePoints || currentPoints),
        streakCurrent: Number(user.streakCurrent || 0),
        streakLastActiveAt: user.streakLastActiveAt || null,
        lastActivityAt: user.lastActivityAt || null,
        nextLevelPoints,
        pointsToNextLevel,
        badgesCount: Array.isArray(user.badges) ? user.badges.length : 0,
        plantHealth: user.plantHealth ?? 100,
        miniGameProgress: Object.fromEntries(user.miniGameProgress || new Map()),
        quizProgress: Object.fromEntries(user.quizProgress || new Map())
      },
      totalsBySource,
      events: recentEvents,
      pagination: {
        total: totalEvents,
        limit,
        offset,
        hasMore: offset + recentEvents.length < totalEvents,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

const aiService = require("../services/aiService");

module.exports = {
  getMyGamification,
  getStudentNudge: async (req, res) => {
    try {
      const user = await User.findById(req.user.id);
      if (!user) return res.status(404).json({ message: "User not found" });

      // Strict data-driven boundaries calculation
      const xpPoints = Number(user.points || 0);
      const nextLevel = Math.floor(xpPoints / 250) + 2;
      const requiredForNext = (nextLevel - 1) * 250;
      const pointsToNextLevel = Math.max(requiredForNext - xpPoints, 0);
      const streak = user.streakCurrent || 0;

      // Time-zone safe daily cache boundary
      const todayKey = new Date().toISOString().slice(0, 10);
      if (user.aiInsightCache?.text && user.aiInsightCache?.dateKey === todayKey) {
        return res.json({ nudge: user.aiInsightCache.text });
      }

      // Protectively wrap the AI to fall back implicitly via aiService
      const nudgeStr = await aiService.generateStudentNudge(pointsToNextLevel, streak);
      
      // Save locally to prevent generation loop
      user.aiInsightCache = {
        text: nudgeStr,
        dateKey: todayKey,
        refreshing: false
      };
      await user.save();

      res.json({ nudge: nudgeStr });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  syncMyActivity: async (req, res) => {
    try {
      const activityAt = req.body?.activityAt ? new Date(req.body.activityAt) : new Date();
      const user = await syncActivity({ userId: req.user.id, activityDate: activityAt });
      res.json({
        message: "Activity synced",
        streakCurrent: Number(user.streakCurrent || 0),
        streakLastActiveAt: user.streakLastActiveAt || null,
        lastActivityAt: user.lastActivityAt || null,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
};
