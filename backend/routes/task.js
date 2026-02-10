const express = require("express");
const router = express.Router();
const { createTask, getTasks, getMyTasks } = require("../controllers/taskController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

// Create task (Teacher/Admin only)
router.post("/create", protect, authorizeRoles("teacher", "admin"), createTask);

// Public: list all tasks
router.get("/", getTasks);

// Teacher/Admin: get tasks created by logged-in teacher
router.get("/my", protect, authorizeRoles("teacher", "admin"), getMyTasks);

module.exports = router;
