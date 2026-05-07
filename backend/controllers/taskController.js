const Task = require("../models/Task");
const User = require("../models/User");
const { buildContentScope } = require("../middleware/scopeFilter");
const {
  listStudentSchedules,
  buildScheduleMatcher,
  isWindowActive,
  getScheduleState,
} = require("../services/scheduleVisibilityService");

// Create task (teacher/admin); validates targetClass against teacher's assignment
exports.createTask = async (req, res) => {
  try {
    const { title, description, points, deadline, impact_model, category, difficulty, whyItMatters, proofType, targetClass } = req.body;

    // Write-time validation: teacher can only create for their assigned class
    if (req.user.role === "teacher" && targetClass) {
      const teacherClass = req.user.classAssigned || "";
      // Normalize: "10" matches "10", "10-A" matches "10-A"
      if (teacherClass && targetClass !== teacherClass) {
        return res.status(403).json({ message: "You can only create tasks for your assigned class." });
      }
    }

    const task = await Task.create({
      title,
      description,
      points,
      deadline,
      createdBy: req.user.id,
      schoolId: req.user.schoolId || null,
      isGlobal: !req.user.schoolId,
      ...(impact_model && {
        impact_model: {
          co2_per_unit: impact_model.co2_per_unit,
          water_per_unit: impact_model.water_per_unit,
          waste_per_unit: impact_model.waste_per_unit,
          energy_per_unit: impact_model.energy_per_unit,
          impact_weight: impact_model.impact_weight,
          unit_label: impact_model.unit_label,
        },
      }),
      ...(category != null && { category }),
      ...(difficulty != null && { difficulty }),
      ...(whyItMatters && { whyItMatters }),
      ...(proofType && { proofType }),
      ...(targetClass && { targetClass }),
    });

    res.json({ message: "Task created", task });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all tasks (scoped to school + class, includes global)
exports.getTasks = async (req, res) => {
  try {
    const scope = buildContentScope(req.user);
    const limit = Math.max(1, Math.min(100, Number(req.query.limit || 30)));
    const offset = Math.max(0, Number(req.query.offset || 0));
    const total = await Task.countDocuments(scope);
    let tasks = await Task.find(scope)
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit);

    if (req.user?.role === "student") {
      const schedules = await listStudentSchedules("task", req.user.schoolId || null);
      const pickSchedule = buildScheduleMatcher(schedules);
      tasks = tasks.map((task) => {
        const schedule = pickSchedule(task);
        return {
          ...task.toObject(),
          schedule: getScheduleState(schedule),
          isAvailableNow: isWindowActive(schedule),
        };
      });
    }
    res.json({
      items: tasks,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + tasks.length < total,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// Get tasks created by the logged-in teacher
exports.getMyTasks = async (req, res) => {
  try {
    const limit = Math.max(1, Math.min(100, Number(req.query.limit || 30)));
    const offset = Math.max(0, Number(req.query.offset || 0));
    const filter = { createdBy: req.user.id };
    const total = await Task.countDocuments(filter);
    const tasks = await Task.find(filter)
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit);
    res.json({
      items: tasks,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + tasks.length < total,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
