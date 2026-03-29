const express = require("express");
const router = express.Router();
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const { getRecommendedTasks, getWeakCategory } = require("../controllers/recommendationController");

router.get("/tasks", protect, authorizeRoles("student"), getRecommendedTasks);
router.get("/weak-category", protect, authorizeRoles("student"), getWeakCategory);

module.exports = router;
