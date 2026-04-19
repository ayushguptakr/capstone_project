const express = require("express");
const router = express.Router();
const { createTeacher, getOverview, getTeacherPerformance, getClassInsights, getClassStudents, createEvent, getEvents, getPrincipalAiInsights } = require("../controllers/principalController");
const { protect, authorizeRoles, requirePasswordSet } = require("../middleware/authMiddleware");
const { aiRateLimiter } = require("../middleware/rateLimiter");

// All principal routes protected
router.use(protect);
router.use(requirePasswordSet);
router.use(authorizeRoles("principal", "admin"));

// Teacher management
router.post("/create-teacher", createTeacher);

router.get("/overview", getOverview);
router.get("/teachers", getTeacherPerformance);
router.get("/classes", getClassInsights);
router.get("/classes/:className/students", getClassStudents);

router.post("/events", createEvent);
router.get("/events", getEvents);

router.get("/ai-insights", aiRateLimiter, getPrincipalAiInsights);

module.exports = router;
