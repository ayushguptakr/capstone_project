const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { getMyGamification, syncMyActivity, getStudentNudge } = require("../controllers/gamificationController");
const { aiRateLimiter } = require("../middleware/rateLimiter");

const router = express.Router();

router.get("/me", protect, getMyGamification);
router.post("/sync-activity", protect, syncMyActivity);
router.get("/nudge", protect, aiRateLimiter, getStudentNudge);

module.exports = router;
