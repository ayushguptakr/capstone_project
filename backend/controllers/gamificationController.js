const User = require("../models/User");
const XPEvent = require("../models/XPEvent");
const { levelFromPoints, syncActivity } = require("../services/gamificationService");

async function getMyGamification(req, res) {
  try {
    const limit = Math.max(1, Math.min(100, Number(req.query.limit || 20)));
    const offset = Math.max(0, Number(req.query.offset || 0));
    const sourceFilter = req.query.source ? String(req.query.source).trim() : "";

    const user = await User.findById(req.user.id).select(
      "name points level experiencePoints streakCurrent streakLastActiveAt lastActivityAt badges"
    );
    if (!user) return res.status(404).json({ message: "User not found" });

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

module.exports = {
  getMyGamification,
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
