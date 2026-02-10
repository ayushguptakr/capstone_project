const User = require("../models/User");
const QuizAttempt = require("../models/QuizAttempt");
const Submission = require("../models/Submission");
const Task = require("../models/Task");
const Quiz = require("../models/Quiz");

// Get teacher dashboard analytics
const getTeacherAnalytics = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const teacher = await User.findById(teacherId);

    // Get students from same school
    const students = await User.find({ 
      role: "student", 
      school: teacher.school 
    }).select("name points badges");

    // Get pending submissions for verification
    const pendingSubmissions = await Submission.find({ status: "pending" })
      .populate("student", "name school")
      .populate("task", "title points")
      .sort({ createdAt: -1 })
      .limit(10);

    // Get teacher's created content
    const createdTasks = await Task.countDocuments({ createdBy: teacherId });
    const createdQuizzes = await Quiz.countDocuments({ createdBy: teacherId });

    // School performance metrics
    const schoolStats = await User.aggregate([
      { $match: { role: "student", school: teacher.school } },
      {
        $group: {
          _id: null,
          totalStudents: { $sum: 1 },
          totalPoints: { $sum: "$points" },
          averagePoints: { $avg: "$points" },
          totalBadges: { $sum: { $size: "$badges" } }
        }
      }
    ]);

    // Recent activity
    const recentQuizAttempts = await QuizAttempt.find()
      .populate({
        path: "student",
        match: { school: teacher.school },
        select: "name"
      })
      .populate("quiz", "title")
      .sort({ createdAt: -1 })
      .limit(5);

    const filteredQuizAttempts = recentQuizAttempts.filter(attempt => attempt.student);

    res.json({
      students,
      pendingSubmissions,
      schoolStats: schoolStats[0] || {
        totalStudents: 0,
        totalPoints: 0,
        averagePoints: 0,
        totalBadges: 0
      },
      contentCreated: {
        tasks: createdTasks,
        quizzes: createdQuizzes
      },
      recentActivity: filteredQuizAttempts
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get verification queue
const getVerificationQueue = async (req, res) => {
  try {
    const submissions = await Submission.find({ status: "pending" })
      .populate("student", "name school")
      .populate("task", "title description points")
      .sort({ createdAt: -1 });

    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Verify submission
const verifySubmission = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { status, feedback } = req.body;

    const submission = await Submission.findById(submissionId)
      .populate("task", "points")
      .populate("student");

    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }

    submission.status = status;
    submission.feedback = feedback;
    submission.verifiedBy = req.user.id;
    submission.verifiedAt = new Date();

    await submission.save();

    // Award points if approved
    if (status === "approved") {
      await User.findByIdAndUpdate(submission.student._id, {
        $inc: { points: submission.task.points }
      });
    }

    res.json({ message: "Submission verified successfully", submission });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getTeacherAnalytics,
  getVerificationQueue,
  verifySubmission
};