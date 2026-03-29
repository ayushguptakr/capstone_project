const Task = require("../models/Task");

// Create task (teacher/admin); optional impact_model, category, difficulty
exports.createTask = async (req, res) => {
  try {
    const { title, description, points, deadline, impact_model, category, difficulty } = req.body;

    const task = await Task.create({
      title,
      description,
      points,
      deadline,
      createdBy: req.user.id,
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
    });

    res.json({ message: "Task created", task });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all tasks (students)
exports.getTasks = async (req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// Get tasks created by the logged-in teacher
exports.getMyTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ createdBy: req.user.id }).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
