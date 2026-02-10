const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const {
  submitTask,
  getMySubmissions,
  getTaskSubmissions
} = require("../controllers/submissionController");

// Student uploads task submission
router.post(
  "/submit",
  protect,
  authorizeRoles("student"),
  upload.single("file"),
  submitTask
);

// Student: view their submissions
router.get("/my", protect, authorizeRoles("student"), getMySubmissions);

// Teacher: view submissions for a specific task
router.get(
  "/task/:taskId",
  protect,
  authorizeRoles("teacher", "admin"),
  getTaskSubmissions
);

module.exports = router;
