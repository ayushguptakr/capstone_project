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

// Resubmit an existing submission
exports.resubmitTask = async (req, res) => {
  try {
    const submissionId = req.params.id;
    const student = req.user.id;
    const { text, submittedAt, lat, lng } = req.body;

    const existingSubmission = await Submission.findOne({ _id: submissionId, student });
    if (!existingSubmission) {
      return res.status(404).json({ message: "Submission not found" });
    }
    
    // Rule: block further resubmissions if approved
    if (existingSubmission.status === "approved") {
      return res.status(400).json({ message: "Submission is already approved." });
    }
    // Rule: max 3 attempts
    if (existingSubmission.attemptCount >= 3) {
      return res.status(400).json({ message: "Maximum attempts reached (3)." });
    }

    const content = text || existingSubmission.content;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : existingSubmission.imageUrl;
    const fileMime = req.file?.mimetype || existingSubmission.fileMime;
    const fileSize = req.file?.size || existingSubmission.fileSize;

    let imageHash = req.file ? null : existingSubmission.imageHash;
    if (req.file) {
      try {
        imageHash = await computeImageHashFromUpload(req.file);
      } catch (e) {}
    }

    const geoTag = req.body.lat != null && req.body.lng != null ? { lat: parseFloat(lat), lng: parseFloat(lng) } : existingSubmission.geoTag;
    const submittedAtDate = submittedAt ? new Date(submittedAt) : existingSubmission.submittedAt;

    existingSubmission.content = content;
    existingSubmission.imageUrl = imageUrl;
    existingSubmission.fileMime = fileMime;
    existingSubmission.fileSize = fileSize;
    existingSubmission.imageHash = imageHash;
    existingSubmission.geoTag = geoTag;
    existingSubmission.submittedAt = submittedAtDate;
    
    // Core Workflow Update
    existingSubmission.status = "pending";
    existingSubmission.attemptCount += 1;
    existingSubmission.flagForReview = false; // reset flags initially

    await existingSubmission.save();

    const trustResult = await trustScoreService.computeTrustScore(
      { _id: existingSubmission._id, imageHash, submittedAt: submittedAtDate, geoTag },
      student,
      false
    );
    await trustScoreService.applyTrustScoreToSubmission(existingSubmission._id, trustResult);

    const updated = await Submission.findById(existingSubmission._id).lean();
    res.status(200).json({
      message: "Resubmission uploaded successfully",
      submission: updated,
      trustScore: trustResult.score,
      flagForReview: trustResult.flagForReview,
    });
  } catch (err) {
    console.error("RESUBMIT ERROR:", err);
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
