const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// Generate JWT token
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// -------------------- SIGNUP --------------------
exports.signup = async (req, res) => {
  try {
    const { name, email, password, role, school } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: role || "student",
      school,
    });

    res.json({
      message: "Signup successful",
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
        email: user.email,
      },
      token: generateToken(user._id, user.role),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// -------------------- LOGIN --------------------
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check user
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid email or password" });

    // Compare password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(400).json({ message: "Invalid email or password" });

    res.json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
        email: user.email,
      },
      token: generateToken(user._id, user.role),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
