const User = require("../models/User");
const Event = require("../models/Event");
const Task = require("../models/Task");
const Submission = require("../models/Submission");
// Assuming there might be a school reference, but for now we'll aggregate globally or by simple filters

exports.getOverview = async (req, res) => {
  try {
    const schoolId = req.user.schoolId;
    if (!schoolId) {
      return res.status(400).json({ message: "Principal is not assigned to any school." });
    }

    const totalStudents = await User.countDocuments({ role: "student", schoolId });
    const totalTeachers = await User.countDocuments({ role: "teacher", schoolId });
    
    // Simplistic metric for active students today (users who had an activity today)
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const activeStudents = await User.countDocuments({ role: "student", schoolId, lastActivityAt: { $gte: startOfDay } });

    // Weekly XP (sum of points of all students, a bit rough but works for mvp)
    const students = await User.find({ role: "student", schoolId }).select("_id points");
    const totalXp = students.reduce((acc, s) => acc + (s.points || 0), 0);

    const studentIds = students.map(s => s._id);
    const tasksCompleted = await Submission.countDocuments({ student: { $in: studentIds }, status: { $in: ["approved", "completed"] } });

    res.json({
      totalStudents,
      activeStudentsToday: activeStudents,
      totalTeachers,
      weeklyXp: totalXp,
      tasksCompleted
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getTeacherPerformance = async (req, res) => {
  try {
    const schoolId = req.user.schoolId;
    const teachers = await User.find({ role: "teacher", schoolId }).select("name email points lastActivityAt");
    
    // In a real app we'd aggregate tasks created by them and submissions approved by them.
    // For MVp, we'll map them with some basic metrics.
    const performance = await Promise.all(teachers.map(async (t) => {
      const tasksCreated = await Task.countDocuments({ createdBy: t._id });
      // Approvals are harder unless we track approvedBy. Let's just use tasksCreated and their own points/level as engagement.
      return {
        _id: t._id,
        name: t.name,
        email: t.email,
        tasksCreated,
        engagementScore: (tasksCreated * 10) + t.points,
        lastActive: t.lastActivityAt
      };
    }));

    // Sort by engagement
    performance.sort((a, b) => b.engagementScore - a.engagementScore);

    res.json({ teachers: performance });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getClassInsights = async (req, res) => {
  try {
    const schoolId = req.user.schoolId;
    // Aggregate students by className
    const classStats = await User.aggregate([
      { $match: { role: "student", schoolId, className: { $ne: null, $ne: "" } } },
      { $group: {
          _id: "$className",
          studentCount: { $sum: 1 },
          totalXp: { $sum: "$points" },
          avgXp: { $avg: "$points" }
      }},
      { $sort: { avgXp: -1 } }
    ]);

    res.json({ classStats });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createEvent = async (req, res) => {
  try {
    const schoolId = req.user.schoolId;
    if (!schoolId) return res.status(400).json({ message: "No school assigned." });

    const { title, durationDays, type, scope, participantClasses } = req.body;
    const event = new Event({
      title,
      durationDays,
      type,
      scope,
      schoolId,
      participantClasses,
      createdBy: req.user._id
    });
    await event.save();
    res.status(201).json({ event });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getEvents = async (req, res) => {
  try {
    const schoolId = req.user.schoolId;
    const events = await Event.find({ schoolId }).sort("-createdAt");
    res.json({ events });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
