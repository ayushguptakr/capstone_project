const express = require("express");
const {
  getTeacherAnalytics,
  getVerificationQueue,
  verifySubmission
} = require("../controllers/teacherController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/analytics", protect, authorize("teacher", "admin"), getTeacherAnalytics);
router.get("/verification-queue", protect, authorize("teacher", "admin"), getVerificationQueue);
router.put("/verify/:submissionId", protect, authorize("teacher", "admin"), verifySubmission);

module.exports = router;