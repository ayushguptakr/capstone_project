const express = require("express");
const {
  getQuizzes,
  getQuizById,
  submitQuiz,
  createQuiz,
  getStudentAttempts
} = require("../controllers/quizController");
const { getAdaptiveQuizzes } = require("../controllers/adaptiveContentController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

// Public routes (protected by auth)
router.get("/", protect, getQuizzes);
router.get("/adaptive", protect, getAdaptiveQuizzes);
router.get("/:id", protect, getQuizById);
router.post("/submit", protect, submitQuiz);
router.get("/attempts/my", protect, getStudentAttempts);

// Teacher/Admin only routes
router.post("/create", protect, authorize("teacher", "admin"), createQuiz);

module.exports = router;
// This file defines the routes for quiz-related operations, including fetching quizzes, submitting quiz answers, and creating new quizzes. The routes are protected by authentication middleware to ensure that only authorized users can access them.