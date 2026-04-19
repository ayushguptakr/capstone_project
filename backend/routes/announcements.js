const express = require("express");
const router = express.Router();
const Announcement = require("../models/Announcement");
const { protect, requirePasswordSet } = require("../middleware/authMiddleware");

/**
 * GET /api/announcements/student
 * Returns announcements targeted at the student's class or "All Classes".
 * Sorted by latest first, limited to 20.
 */
router.get("/student", protect, requirePasswordSet, async (req, res) => {
  try {
    const user = req.user;
    const studentClass = user.className || user.classAssigned || user.class || "";

    // Build the target filter: match student's class OR "All Classes"
    const targetFilter = [{ target: "All Classes" }];
    if (studentClass) {
      targetFilter.push({ target: studentClass });
    }

    const filter = { $or: targetFilter };

    // Scope to same school if available (use the String field, not ObjectId)
    if (user.school) {
      filter.school = { $in: [user.school, "", null, undefined] };
    }

    const announcements = await Announcement.find(filter)
      .populate("teacher", "name role")
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    res.json(announcements);
  } catch (err) {
    console.error("[Announcements] Error:", err.message);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
