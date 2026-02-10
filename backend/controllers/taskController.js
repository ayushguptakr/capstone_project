const Task = require("../models/Task");

// Create task (teacher/admin)
exports.createTask = async (req, res) => {
  try {
    const { title, description, points, deadline } = req.body;

    const task = await Task.create({
      title,
      description,
      points,
      deadline,
      createdBy: req.user.id
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
