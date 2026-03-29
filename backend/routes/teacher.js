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
  getCustomBadges
} = require("../controllers/teacherController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/analytics", protect, authorize("teacher", "admin"), getTeacherAnalytics);
router.get("/verification-queue", protect, authorize("teacher", "admin"), getVerificationQueue);
router.put("/verify/:submissionId", protect, authorize("teacher", "admin"), verifySubmission);
router.get("/announcements", protect, authorize("teacher", "admin"), getAnnouncements);
router.post("/announcements", protect, authorize("teacher", "admin"), createAnnouncement);
router.get("/schedules", protect, authorize("teacher", "admin"), getSchedules);
router.post("/schedules", protect, authorize("teacher", "admin"), createSchedule);
router.get("/badges", protect, authorize("teacher", "admin"), getCustomBadges);
router.post("/badges", protect, authorize("teacher", "admin"), createCustomBadge);
router.post("/bonus-xp", protect, authorize("teacher", "admin"), assignBonusXP);

module.exports = router;