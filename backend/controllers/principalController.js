const User = require("../models/User");
const Event = require("../models/Event");
const Task = require("../models/Task");
const Submission = require("../models/Submission");
const crypto = require("crypto");

// -------------------- CREATE TEACHER (PRINCIPAL ONLY) --------------------
exports.createTeacher = async (req, res) => {
  try {
    const principal = req.user;
    if (!principal.schoolId) {
      return res.status(400).json({ message: "Principal is not assigned to any school." });
    }

    const { name, email, classAssigned, section } = req.body;

    // Validation
    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Teacher name is required." });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ message: "Teacher email is required." });
    }

    // Check for existing user
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "A user with this email already exists." });
    }

    // Generate a secure temporary password
    const tempPassword = crypto.randomBytes(4).toString("hex"); // 8-char hex string

    const teacher = await User.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: tempPassword,
      role: "teacher",
      schoolId: principal.schoolId,
      classAssigned: classAssigned || "",
      section: section || "",
      className: classAssigned && section ? `${classAssigned}${section}` : classAssigned || "",
      isFirstLogin: true,
      createdBy: principal._id,
    });

    res.status(201).json({
      message: "Teacher account created successfully",
      teacher: {
        _id: teacher._id,
        name: teacher.name,
        email: teacher.email,
        classAssigned: teacher.classAssigned,
        section: teacher.section,
        schoolId: teacher.schoolId,
        isFirstLogin: true,
      },
      credentials: {
        email: teacher.email,
        temporaryPassword: tempPassword,
        note: "Share these credentials securely. The teacher must change their password on first login.",
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

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

exports.getClassStudents = async (req, res) => {
  try {
    const schoolId = req.user.schoolId;
    const { className } = req.params;
    
    const students = await User.find({ role: "student", schoolId, className })
      .select("name email points level lastActivityAt");

    const studentData = await Promise.all(students.map(async (st) => {
      const tasksCompleted = await Submission.countDocuments({ student: st._id, status: { $in: ["approved", "completed"] } });
      return {
        _id: st._id,
        name: st.name,
        email: st.email,
        points: st.points,
        level: st.level || 1,
        tasksCompleted,
        lastActive: st.lastActivityAt
      };
    }));

    // Sort by points descending
    studentData.sort((a, b) => (b.points || 0) - (a.points || 0));

    res.json({ students: studentData });
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

const aiService = require("../services/aiService");

exports.getPrincipalAiInsights = async (req, res) => {
  try {
    const principal = req.user;
    if (!principal) return res.status(404).json({ message: "Principal not found" });

    const todayKey = new Date().toISOString().slice(0, 10);
    if (principal.aiInsightCache?.text && principal.aiInsightCache?.dateKey === todayKey) {
      return res.json({ text: principal.aiInsightCache.text });
    }

    const schoolId = principal.schoolId;
    const classStatsRaw = await User.aggregate([
      { $match: { role: "student", schoolId, className: { $ne: null, $ne: "" } } },
      { $group: {
          _id: "$className",
          avgXp: { $avg: "$points" }
      }},
      { $sort: { avgXp: -1 } }
    ]);
    
    const topClass = classStatsRaw[0] ? classStatsRaw[0]._id : "None";
    const weakClass = classStatsRaw[classStatsRaw.length - 1] ? classStatsRaw[classStatsRaw.length - 1]._id : "None";

    const metrics = {
      schoolName: "Your School",
      studentCount: await User.countDocuments({ role: "student", schoolId }),
      topClass,
      weakClass
    };

    if (principal.aiInsightCache?.text) {
      aiService.generatePrincipalInsight(metrics).then(async (newText) => {
        await User.findByIdAndUpdate(principal._id, {
          "aiInsightCache.text": newText,
          "aiInsightCache.dateKey": todayKey
        });
      }).catch(console.error);
      return res.json({ text: principal.aiInsightCache.text, refreshing: true });
    }

    const newText = await aiService.generatePrincipalInsight(metrics);
    principal.aiInsightCache = { text: newText, dateKey: todayKey, refreshing: false };
    await principal.save();

    res.json({ text: newText });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
