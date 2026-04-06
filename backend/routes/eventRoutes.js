const express = require("express");
const router = express.Router();
const Event = require("../models/Event");
const { protect } = require("../middleware/authMiddleware");

// @route   GET /api/events
// @desc    Get all active events for the logged-in user's school
// @access  Private (Teacher, Student)
router.get("/", protect, async (req, res) => {
  try {
    const schoolId = req.user.schoolId;
    if (!schoolId) {
      return res.status(400).json({ error: "User is not assigned to a school" });
    }

    // Find active events for this school
    const events = await Event.find({
      schoolId: schoolId,
      status: "active"
    }).sort({ createdAt: -1 });

    res.json({ events });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
