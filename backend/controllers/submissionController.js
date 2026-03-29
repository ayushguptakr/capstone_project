const Submission = require("../models/Submission");
const Task = require("../models/Task");
const { computeImageHashFromUpload } = require("../utils/imageHash");
const trustScoreService = require("../services/trustScoreService");

// Create submission (schema: task, student, content, imageUrl; optional submittedAt, geoTag)
exports.submitTask = async (req, res) => {
  try {
    const { taskId, text, submittedAt, lat, lng } = req.body;
    const task = taskId;
    const student = req.user.id;
    const content = text || "";
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : undefined;
    const fileMime = req.file?.mimetype;
    const fileSize = req.file?.size;

    let imageHash = null;
    if (req.file) {
      try {
        imageHash = await computeImageHashFromUpload(req.file);
      } catch (e) {
        // non-fatal
      }
    }

    const geoTag =
      lat != null && lng != null ? { lat: parseFloat(lat), lng: parseFloat(lng) } : undefined;
    const submittedAtDate = submittedAt ? new Date(submittedAt) : undefined;

    const submission = await Submission.create({
      task,
      student,
      content,
      imageUrl,
      fileMime,
      fileSize,
      imageHash,
      submittedAt: submittedAtDate,
      geoTag,
    });

    const trustResult = await trustScoreService.computeTrustScore(
      { _id: submission._id, imageHash, submittedAt: submittedAtDate, geoTag },
      student,
      false
    );
    await trustScoreService.applyTrustScoreToSubmission(submission._id, trustResult);

    const updated = await Submission.findById(submission._id).lean();
    res.status(201).json({
      message: "Submission uploaded successfully",
      submission: updated,
      trustScore: trustResult.score,
      flagForReview: trustResult.flagForReview,
    });
  } catch (err) {
    console.error("SUBMIT ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

// Student: Get their own submissions
exports.getMySubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find({ student: req.user.id }).populate("task", "title description points category difficulty");
    res.json(submissions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Teacher: See submissions for a task
exports.getTaskSubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find({ task: req.params.taskId }).populate("student", "name email school");
    res.json(submissions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
