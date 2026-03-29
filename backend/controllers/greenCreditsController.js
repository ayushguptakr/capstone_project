/**
 * Sustainability Credit System (Green Credits)
 * Balance, display on certificates, export sustainability report data.
 */
const User = require("../models/User");
const ecoImpactLogRepository = require("../repositories/ecoImpactLogRepository");
const sustainabilityAnalyticsService = require("../services/sustainabilityAnalyticsService");

async function getBalance(req, res) {
  try {
    const user = await User.findById(req.user.id).select("greenCredits name school").lean();
    res.json({ greenCredits: user?.greenCredits ?? 0, name: user?.name, school: user?.school });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

/**
 * Redeem green credits (decrement); optional payload e.g. rewardId.
 * For now we only support "redeem" with amount; actual reward coupling can be added later.
 */
async function redeem(req, res) {
  try {
    const { amount, reason } = req.body;
    const amt = Math.max(0, parseInt(amount, 10) || 0);
    if (amt === 0) return res.status(400).json({ message: "Invalid amount" });
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    const current = user.greenCredits ?? 0;
    if (current < amt) return res.status(400).json({ message: "Insufficient green credits" });
    user.greenCredits = current - amt;
    await user.save();
    res.json({
      message: "Redeemed successfully",
      greenCreditsRedeemed: amt,
      greenCreditsRemaining: user.greenCredits,
      reason: reason || "redemption",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

/**
 * Sustainability report data for display on certificates or PDF export.
 * Returns user impact summary and green credits; frontend or PDF service can render.
 */
async function getSustainabilityReport(req, res) {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select("name school className greenCredits").lean();
    if (!user) return res.status(404).json({ message: "User not found" });
    const logs = await ecoImpactLogRepository.findByStudent(userId);
    const totals = logs.reduce(
      (acc, l) => ({
        co2Reduced: acc.co2Reduced + (l.co2Reduced || 0),
        waterSaved: acc.waterSaved + (l.waterSaved || 0),
        wasteDiverted: acc.wasteDiverted + (l.wasteDiverted || 0),
        energySaved: acc.energySaved + (l.energySaved || 0),
      }),
      { co2Reduced: 0, waterSaved: 0, wasteDiverted: 0, energySaved: 0 }
    );
    const report = {
      generatedAt: new Date().toISOString(),
      user: { name: user.name, school: user.school, className: user.className },
      greenCredits: user.greenCredits ?? 0,
      impactSummary: totals,
      actionsCount: logs.length,
    };
    const accept = req.headers.accept || "";
    if (accept.includes("application/pdf")) {
      res.setHeader("Content-Type", "application/json");
      res.json({ ...report, note: "For PDF export use this JSON with a PDF generator or /api/green-credits/report for JSON." });
      return;
    }
    res.json(report);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

module.exports = {
  getBalance,
  redeem,
  getSustainabilityReport,
};
