const express = require("express");
const router = express.Router();
const { createTask, getTasks, getMyTasks } = require("../controllers/taskController");
const { protect, authorizeRoles, requirePasswordSet } = require("../middleware/authMiddleware");

// Create task (Teacher/Admin only)
router.post("/create", protect, requirePasswordSet, authorizeRoles("teacher", "admin"), createTask);

// List tasks (scoped to requester)
router.get("/", protect, requirePasswordSet, getTasks);

// Teacher/Admin: get tasks created by logged-in teacher
router.get("/my", protect, requirePasswordSet, authorizeRoles("teacher", "admin"), getMyTasks);

module.exports = router;
