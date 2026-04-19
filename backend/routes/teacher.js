const express = require("express");
const {
  getTeacherAnalytics,
  getVerificationQueue,
  verifySubmission,
  createAnnouncement,
  getAnnouncements,
  createSchedule,
  getSchedules,
  assignBonusXP,
  createCustomBadge,
  getCustomBadges,
  getAiInsights,
  generateMission,
  generateQuiz,
  draftFeedback
} = require("../controllers/teacherController");
const { protect, authorize, requirePasswordSet } = require("../middleware/authMiddleware");
const { aiRateLimiter } = require("../middleware/rateLimiter");

const router = express.Router();

router.get("/analytics", protect, requirePasswordSet, authorize("teacher", "admin"), getTeacherAnalytics);
router.get("/verification-queue", protect, requirePasswordSet, authorize("teacher", "admin"), getVerificationQueue);
router.put("/verify/:submissionId", protect, requirePasswordSet, authorize("teacher", "admin"), verifySubmission);
router.get("/announcements", protect, requirePasswordSet, authorize("teacher", "admin"), getAnnouncements);
router.post("/announcements", protect, requirePasswordSet, authorize("teacher", "admin"), createAnnouncement);
router.get("/schedules", protect, requirePasswordSet, authorize("teacher", "admin"), getSchedules);
router.post("/schedules", protect, requirePasswordSet, authorize("teacher", "admin"), createSchedule);
router.get("/badges", protect, requirePasswordSet, authorize("teacher", "admin"), getCustomBadges);
router.post("/badges", protect, requirePasswordSet, authorize("teacher", "admin"), createCustomBadge);
router.post("/bonus-xp", protect, requirePasswordSet, authorize("teacher", "admin"), assignBonusXP);

router.get("/ai-insights", protect, requirePasswordSet, authorize("teacher", "admin"), aiRateLimiter, getAiInsights);
router.post("/generate-mission", protect, requirePasswordSet, authorize("teacher", "admin"), aiRateLimiter, generateMission);
router.post("/generate-quiz", protect, requirePasswordSet, authorize("teacher", "admin"), aiRateLimiter, generateQuiz);
router.post("/draft-feedback", protect, requirePasswordSet, authorize("teacher", "admin"), aiRateLimiter, draftFeedback);

module.exports = router;