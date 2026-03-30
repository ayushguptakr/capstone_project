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
    const { name, email, password, role, school, className, class: classValue, section } = req.body;

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
      className: className || "",
      class: classValue || "",
      section: section || "",
    });

    res.json({
      message: "Signup successful",
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
        email: user.email,
        school: user.school || "",
        className: user.className || "",
        class: user.class || "",
        section: user.section || "",
        points: user.points || 0,
        level: user.level || 1,
        streakCurrent: user.streakCurrent || 0,
        equippedAvatar: user.equippedAvatar || "User",
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
        school: user.school || "",
        className: user.className || "",
        class: user.class || "",
        section: user.section || "",
        points: user.points || 0,
        level: user.level || 1,
        streakCurrent: user.streakCurrent || 0,
        equippedAvatar: user.equippedAvatar || "User",
      },
      token: generateToken(user._id, user.role),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// -------------------- CURRENT USER PROFILE --------------------
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      "name role email school className class section points level experiencePoints streakCurrent streakLastActiveAt lastActivityAt badges equippedAvatar equippedSkins"
    );
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// -------------------- UPDATE AVATAR --------------------
exports.updateAvatar = async (req, res) => {
  try {
    const { iconName } = req.body;
    if (!iconName) return res.status(400).json({ message: "iconName is required" });
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { equippedAvatar: iconName },
      { new: true }
    ).select("-password -__v");
    res.json({ message: "Avatar updated", user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// -------------------- UPDATE MASCOT SKINS --------------------
exports.updateSkins = async (req, res) => {
  try {
    const { category, skinId } = req.body;
    const validCategories = ["hat", "accessory", "effect", "evolution"];
    if (!category || !validCategories.includes(category)) {
      return res.status(400).json({ message: "Invalid category. Must be: hat, accessory, effect, or evolution" });
    }
    // skinId can be null (to unequip)
    const updateKey = `equippedSkins.${category}`;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { [updateKey]: skinId || null },
      { new: true }
    ).select("-password -__v");
    res.json({ message: "Skin updated", user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
