const express = require("express");
const router = express.Router();
const { getOverview, getTeacherPerformance, getClassInsights, createEvent, getEvents } = require("../controllers/principalController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

// All principal routes protected
router.use(protect);
router.use(authorizeRoles("principal", "admin"));

router.get("/overview", getOverview);
router.get("/teachers", getTeacherPerformance);
router.get("/classes", getClassInsights);

router.post("/events", createEvent);
router.get("/events", getEvents);

module.exports = router;
