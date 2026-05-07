const FeatureToggle = require("../models/FeatureToggle");

function requireFeature(featureKey, options = {}) {
  const { allowAdmin = true } = options;

  return async (req, res, next) => {
    try {
      if (allowAdmin && req.user?.role === "admin") {
        return next();
      }

      let toggles = await FeatureToggle.findOne().lean();
      if (!toggles) {
        toggles = await FeatureToggle.create({});
      }

      const enabled = Boolean(toggles?.[featureKey]);
      if (!enabled) {
        return res.status(403).json({
          message: "This feature is currently disabled by EcoQuest admin.",
          feature: featureKey,
          code: "FEATURE_DISABLED",
        });
      }

      return next();
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  };
}

module.exports = { requireFeature };
