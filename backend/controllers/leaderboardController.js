const User = require("../models/User");
const QuizAttempt = require("../models/QuizAttempt");
const Submission = require("../models/Submission");

// Get leaderboard (school-scoped by default, global opt-in)
const getLeaderboard = async (req, res) => {
  try {
    const { type = "school", class: classValue, section } = req.query;
    const range = String(req.query.range || "all").toLowerCase();
    const limit = Math.max(1, Math.min(100, Number(req.query.limit || 50)));
    const offset = Math.max(0, Number(req.query.offset || 0));
    
    let filter = { role: "student" };

    // School scoping: enforced from token, NEVER from query params
    if (type === "global") {
      // Global leaderboard — read-only, no school filter
    } else {
      // Default: school-scoped
      if (req.user.schoolId) {
        filter.schoolId = req.user.schoolId;
      }
    }

    if (classValue) {
      filter.$or = [{ class: classValue }, { className: new RegExp(String(classValue), "i") }];
    }
    if (section) {
      filter.section = section;
    }

    const sortField = range === "week" ? "weeklyXP" : "points";
    const total = await User.countDocuments(filter);
    const leaderboard = await User.find(filter)
      .select("name className class section points level badges league weeklyXP streakCurrent school schoolId")
      .populate("schoolId", "name")
      .sort({ [sortField]: -1, points: -1, _id: 1 })
      .skip(offset)
      .limit(limit);

    const leaderboardWithRank = leaderboard.map((user, index) => ({
      ...user.toObject(),
      schoolName: user?.schoolId?.name || user?.school || "",
      rank: offset + index + 1
    }));

    res.json({
      items: leaderboardWithRank,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + leaderboardWithRank.length < total,
      },
    });
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
    
    // Get student's rank (scoped to same school)
    const rankFilter = {
      role: "student",
      points: { $gt: student.points }
    };
    if (req.user.schoolId) {
      rankFilter.schoolId = req.user.schoolId;
    }
    const higherRankedCount = await User.countDocuments(rankFilter);
    const rank = higherRankedCount + 1;

    // Get quiz stats with aggregation (avoids loading all attempts into memory)
    const quizAgg = await QuizAttempt.aggregate([
      { $match: { student: student._id } },
      {
        $group: {
          _id: null,
          totalAttempts: { $sum: 1 },
          averageScore: { $avg: "$percentage" },
          bestScore: { $max: "$percentage" },
        },
      },
    ]);
    const quizSummary = quizAgg[0] || {};
    const quizStats = {
      totalAttempts: Number(quizSummary.totalAttempts || 0),
      averageScore: Number(quizSummary.averageScore || 0),
      bestScore: Number(quizSummary.bestScore || 0),
    };

    // Get task submission stats with aggregation (single query)
    const submissionAgg = await Submission.aggregate([
      { $match: { student: student._id } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);
    const submissionCounts = submissionAgg.reduce((acc, row) => {
      acc[String(row._id || "unknown")] = Number(row.count || 0);
      return acc;
    }, {});
    const totalSubmissions = Object.values(submissionCounts).reduce((sum, n) => sum + n, 0);
    const taskStats = {
      totalSubmissions,
      approvedSubmissions: Number(submissionCounts.approved || 0),
      pendingSubmissions: Number(submissionCounts.pending || 0),
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