const express = require("express");
const router = express.Router();
const {
  createTeacher,
  getOverview,
  getTeacherPerformance,
  getClassInsights,
  getClassStudents,
  createEvent,
  getEvents,
  getPrincipalAiInsights,
  createClass,
  getSchoolClasses,
  assignTeacherToClasses,
  createSchoolAnnouncement,
} = require("../controllers/principalController");
const { protect, authorizeRoles, requirePasswordSet } = require("../middleware/authMiddleware");
const { aiRateLimiter } = require("../middleware/rateLimiter");

// All principal routes protected
router.use(protect);
router.use(requirePasswordSet);
router.use(authorizeRoles("principal", "admin"));

// Teacher management
router.post("/create-teacher", createTeacher);
router.post("/assign-teacher", assignTeacherToClasses);

// Class management
router.post("/classes", createClass);
router.get("/classes", getSchoolClasses);
router.get("/classes/:className/students", getClassStudents);

// Analytics
router.get("/overview", getOverview);
router.get("/teachers", getTeacherPerformance);
router.get("/class-insights", getClassInsights);

// Events
router.post("/events", createEvent);
router.get("/events", getEvents);

// Announcements
router.post("/announcements", createSchoolAnnouncement);

// AI
router.get("/ai-insights", aiRateLimiter, getPrincipalAiInsights);

module.exports = router;

