const User = require("../models/User");
const QuizAttempt = require("../models/QuizAttempt");
const Submission = require("../models/Submission");

// Get global leaderboard
const getLeaderboard = async (req, res) => {
  try {
    const { limit = 50, school, class: classValue, section } = req.query;
    
    let filter = { role: "student" };
    if (school) {
      filter.school = school;
    }
    if (classValue) {
      filter.$or = [{ class: classValue }, { className: new RegExp(String(classValue), "i") }];
    }
    if (section) {
      filter.section = section;
    }

    const leaderboard = await User.find(filter)
      .select("name school className class section points level badges league weeklyXP streakCurrent")
      .sort({ points: -1 })
      .limit(parseInt(limit));

    const leaderboardWithRank = leaderboard.map((user, index) => ({
      ...user.toObject(),
      rank: index + 1
    }));

    res.json(leaderboardWithRank);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get student's progress and stats
const getStudentProgress = async (req, res) => {
  try {
    const studentId = req.user.id;
    
    const student = await User.findById(studentId).select(
      "name points badges school className class section level experiencePoints streakCurrent streakLastActiveAt lastActivityAt"
    );
    
    // Get student's rank
    const higherRankedCount = await User.countDocuments({
      role: "student",
      points: { $gt: student.points }
    });
    const rank = higherRankedCount + 1;

    // Get quiz stats
    const quizAttempts = await QuizAttempt.find({ student: studentId });
    const quizStats = {
      totalAttempts: quizAttempts.length,
      averageScore: quizAttempts.length > 0 
        ? quizAttempts.reduce((sum, attempt) => sum + attempt.percentage, 0) / quizAttempts.length 
        : 0,
      bestScore: quizAttempts.length > 0 
        ? Math.max(...quizAttempts.map(attempt => attempt.percentage)) 
        : 0
    };

    // Get task submission stats
    const submissions = await Submission.find({ student: studentId });
    const taskStats = {
      totalSubmissions: submissions.length,
      approvedSubmissions: submissions.filter(s => s.status === "approved").length,
      pendingSubmissions: submissions.filter(s => s.status === "pending").length
    };

    res.json({
      student: {
        ...student.toObject(),
        rank
      },
      quizStats,
      taskStats
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get school-wise leaderboard
const getSchoolLeaderboard = async (req, res) => {
  try {
    const schoolStats = await User.aggregate([
      { $match: { role: "student", school: { $exists: true, $ne: "" } } },
      {
        $group: {
          _id: "$school",
          totalPoints: { $sum: "$points" },
          studentCount: { $sum: 1 },
          averagePoints: { $avg: "$points" }
        }
      },
      { $sort: { totalPoints: -1 } },
      { $limit: 10 }
    ]);

    const schoolLeaderboard = schoolStats.map((school, index) => ({
      school: school._id,
      totalPoints: school.totalPoints,
      studentCount: school.studentCount,
      averagePoints: Math.round(school.averagePoints),
      rank: index + 1
    }));

    res.json(schoolLeaderboard);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getLeaderboard,
  getStudentProgress,
  getSchoolLeaderboard
};