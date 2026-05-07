const Submission = require("../models/Submission");
const Task = require("../models/Task");
const { computeImageHashFromUpload } = require("../utils/imageHash");
const trustScoreService = require("../services/trustScoreService");
const {
  listStudentSchedules,
  buildScheduleMatcher,
  isWindowActive,
} = require("../services/scheduleVisibilityService");

function getUserClassKey(user) {
  return user?.classAssigned || user?.className || user?.class || null;
}

// Create submission (schema: task, student, content, imageUrl; optional submittedAt, geoTag)
exports.submitTask = async (req, res) => {
  try {
    const { taskId, text, submittedAt, lat, lng } = req.body;
    if (!taskId) {
      return res.status(400).json({ message: "taskId is required" });
    }

    const taskDoc = await Task.findById(taskId).lean();
    if (!taskDoc) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (req.user?.role === "student") {
      const schedules = await listStudentSchedules("task", req.user.schoolId || null);
      const pickSchedule = buildScheduleMatcher(schedules);
      if (!isWindowActive(pickSchedule(taskDoc))) {
        return res.status(403).json({ message: "This task is currently outside its scheduled window." });
      }
    }

    // School isolation (non-admin)
    if (req.user?.role !== "admin") {
      const userSchool = req.user?.schoolId || null;
      const taskSchool = taskDoc.schoolId || null;
      const isTaskGlobal = Boolean(taskDoc.isGlobal);
      if (!isTaskGlobal && String(taskSchool || "") !== String(userSchool || "")) {
        return res.status(403).json({ message: "You cannot submit to a task outside your school." });
      }
    }

    // Class enforcement (students)
    const classKey = getUserClassKey(req.user);
    if (req.user?.role === "student" && taskDoc.targetClass) {
      if (!classKey || String(taskDoc.targetClass) !== String(classKey)) {
        return res.status(403).json({ message: "This task is not assigned to your class." });
      }
    }

    // Deadline enforcement (if set)
    if (taskDoc.deadline) {
      const deadline = new Date(taskDoc.deadline).getTime();
      if (!Number.isNaN(deadline) && Date.now() > deadline) {
        return res.status(400).json({ message: "Task deadline has passed." });
      }
    }

    // Proof type enforcement
    const proofType = String(taskDoc.proofType || "any");
    const hasFile = Boolean(req.file);
    const hasText = typeof text === "string" && text.trim().length > 0;
    if (proofType === "image" && !hasFile) {
      return res.status(400).json({ message: "Image proof is required for this task." });
    }
    if (proofType === "text" && !hasText) {
      return res.status(400).json({ message: "Text proof is required for this task." });
    }
    if (proofType === "video" && !hasFile) {
      // Upload middleware currently supports a single file; treat as required file.
      return res.status(400).json({ message: "Video proof is required for this task." });
    }

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
      schoolId: req.user.schoolId || null,
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
    const limit = Math.max(1, Math.min(100, Number(req.query.limit || 30)));
    const offset = Math.max(0, Number(req.query.offset || 0));
    const filter = { student: req.user.id };
    const total = await Submission.countDocuments(filter);
    const submissions = await Submission.find(filter)
      .populate("task", "title description points category difficulty")
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit);
    res.json({
      items: submissions,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + submissions.length < total,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Teacher: See submissions for a task (scoped to teacher's school)
exports.getTaskSubmissions = async (req, res) => {
  try {
    const filter = { task: req.params.taskId };
    if (req.user.schoolId) {
      filter.schoolId = req.user.schoolId;
    }
    const submissions = await Submission.find(filter).populate("student", "name email school className class section");
    res.json(submissions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
