const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = require("../middleware/upload");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const {
  submitTask,
  getMySubmissions,
  getTaskSubmissions
} = require("../controllers/submissionController");

const handleSingleUpload = (req, res, next) => {
  upload.single("file")(req, res, (err) => {
    if (!err) return next();
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ message: "File is too large (max 15MB)." });
      }
      return res.status(400).json({ message: err.message });
    }
    return res.status(400).json({ message: err.message || "Upload failed" });
  });
};

// Student uploads task submission
router.post(
  "/submit",
  protect,
  authorizeRoles("student"),
  handleSingleUpload,
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
