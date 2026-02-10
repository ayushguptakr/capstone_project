const Submission = require("../models/Submission");
const Task = require("../models/Task");

// Create submission
exports.submitTask = async (req, res) => {
  try {
    console.log("REQ BODY:", req.body);
    console.log("REQ FILE:", req.file);

    const { taskId, text } = req.body;   // <-- FIXED (text, NOT textAnswer)

    const fileData = req.file
      ? {
          filename: req.file.filename,
          url: `/uploads/${req.file.filename}`,   // <-- FIXED URL
          fileType: req.file.mimetype,
        }
      : null;

    const submission = await Submission.create({
      taskId,
      studentId: req.user.id,
      text: text || "",        // <-- FIXED
      file: fileData,
    });

    res.status(201).json({
      message: "Submission uploaded successfully",
      submission,
    });
  } catch (err) {
    console.error("SUBMIT ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

// Student: Get their own submissions
exports.getMySubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find({ studentId: req.user.id })
      .populate("taskId");   // <-- populate task details

    res.json(submissions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Teacher: See submissions for a task
exports.getTaskSubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find({ taskId: req.params.taskId })
      .populate("studentId", "name email");

    res.json(submissions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
