const User = require("../models/User");
const School = require("../models/School");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// Generate JWT token
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// -------------------- PUBLIC SCHOOLS --------------------
exports.getPublicSchools = async (req, res) => {
  try {
    const schools = await School.find({ status: { $ne: "inactive" } }).select("name address");
    res.json({ schools });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// -------------------- SIGNUP (STUDENT ONLY) --------------------
exports.signup = async (req, res) => {
  try {
    const { name, email, password, schoolId, className, class: classValue, section } = req.body;

    // SECURITY: Reject any attempt to pass a role via the public signup endpoint.
    // Teachers are created by principals, principals by admins.
    if (req.body.role) {
      return res.status(403).json({
        message: "Role cannot be set during public signup. Only student accounts can be created here.",
      });
    }

    // Basic input validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required." });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters." });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create user — role is ALWAYS "student" from public signup
    const user = await User.create({
      name,
      email,
      password,
      role: "student",
      schoolId: schoolId || undefined,
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
        isFirstLogin: user.isFirstLogin,
        schoolId: user.schoolId || null,
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
        isFirstLogin: user.isFirstLogin,
        schoolId: user.schoolId || null,
      },
      token: generateToken(user._id, user.role),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const { applyPlantDecay } = require("../services/gamificationService");

// -------------------- CURRENT USER PROFILE --------------------
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    applyPlantDecay(user);
    if (user.isModified("plantHealth") || user.isModified("plantLastDecayedAt")) {
      await user.save();
    }

    // Need to return exactly the fields expected, or toObject() for everything.
    const userObj = {
      _id: user._id,
      name: user.name,
      role: user.role,
      email: user.email,
      schoolId: user.schoolId,
      className: user.className,
      class: user.class,
      section: user.section,
      points: user.points,
      level: user.level,
      experiencePoints: user.experiencePoints,
      streakCurrent: user.streakCurrent,
      streakLastActiveAt: user.streakLastActiveAt,
      lastActivityAt: user.lastActivityAt,
      badges: user.badges,
      equippedAvatar: user.equippedAvatar,
      equippedSkins: user.equippedSkins,
      plantHealth: user.plantHealth ?? 100
    };

    res.json({ user: userObj });
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

// -------------------- SET NEW PASSWORD (FIRST LOGIN) --------------------
exports.setNewPassword = async (req, res) => {
  try {
    const { password } = req.body;
    if (!password) return res.status(400).json({ message: "Password is required" });

    // The user model pre-save hook handles bcrypt hashing
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.password = password;
    user.isFirstLogin = false;
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
