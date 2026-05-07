const express = require("express");
const router = express.Router();
const Announcement = require("../models/Announcement");
const { protect, requirePasswordSet } = require("../middleware/authMiddleware");

/**
 * GET /api/announcements/student
 * Returns announcements targeted at the student's class or "All Classes",
 * scoped to their school via schoolId (ObjectId).
 */
router.get("/student", protect, requirePasswordSet, async (req, res) => {
  try {
    const user = req.user;
    const studentClass = user.className || user.classAssigned || user.class || "";
    const limit = Math.max(1, Math.min(50, Number(req.query.limit || 20)));
    const offset = Math.max(0, Number(req.query.offset || 0));

    // Build the target filter: match student's class OR "All Classes"
    const targetFilter = [{ target: "All Classes" }];
    if (studentClass) {
      targetFilter.push({ target: studentClass });
    }

    const filter = { $or: targetFilter };

    // Scope to same school using ObjectId
    if (user.schoolId) {
      filter.schoolId = user.schoolId;
    }

    const total = await Announcement.countDocuments(filter);
    const announcements = await Announcement.find(filter)
      .populate("teacher", "name role")
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .lean();

    res.json({
      items: announcements,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + announcements.length < total,
      },
    });
  } catch (err) {
    console.error("[Announcements] Error:", err.message);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

