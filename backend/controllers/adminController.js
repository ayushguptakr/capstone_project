const School = require("../models/School");
const User = require("../models/User");
const FeatureToggle = require("../models/FeatureToggle");

// ==================== SCHOOL MANAGEMENT ====================

exports.createSchool = async (req, res) => {
  try {
    const { name, address } = req.body;
    if (!name) return res.status(400).json({ error: "School name is required." });
    const school = new School({ name, address });
    await school.save();
    res.status(201).json({ school });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getSchools = async (req, res) => {
  try {
    const limit = Math.max(1, Math.min(100, Number(req.query.limit || 25)));
    const offset = Math.max(0, Number(req.query.offset || 0));
    const q = String(req.query.q || "").trim();

    const filter = {};
    if (q) {
      filter.$or = [
        { name: { $regex: new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i") } },
        { address: { $regex: new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i") } },
      ];
    }

    const total = await School.countDocuments(filter);
    const schools = await School.find(filter)
      .populate("principalId", "name email")
      .sort({ createdAt: -1, _id: -1 })
      .skip(offset)
      .limit(limit);

    res.json({
      items: schools,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + schools.length < total,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateSchool = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, address, status } = req.body;
    const update = {};
    if (name !== undefined) update.name = name;
    if (address !== undefined) update.address = address;
    if (status !== undefined) update.status = status;

    const school = await School.findByIdAndUpdate(id, update, { new: true }).populate("principalId", "name email");
    if (!school) return res.status(404).json({ error: "School not found." });
    res.json({ school });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteSchool = async (req, res) => {
  try {
    const { id } = req.params;
    const school = await School.findByIdAndUpdate(id, { status: "inactive" }, { new: true });
    if (!school) return res.status(404).json({ error: "School not found." });
    res.json({ message: "School deactivated", school });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.assignPrincipal = async (req, res) => {
  try {
    const { schoolId, name, email, password } = req.body;

    if (!schoolId || !name || !email || !password) {
      return res.status(400).json({ error: "schoolId, name, email, and password are all required." });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: "A user with this email already exists." });

    const principal = await User.create({
      name,
      email,
      password,
      role: "principal",
      schoolId,
      isFirstLogin: true,
    });

    const school = await School.findByIdAndUpdate(
      schoolId,
      { principalId: principal._id },
      { new: true }
    ).populate("principalId", "name email");

    res.status(201).json({ school, principal: { _id: principal._id, name: principal.name, email: principal.email } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ==================== USER MANAGEMENT ====================

exports.getUsers = async (req, res) => {
  try {
    const limit = Math.max(1, Math.min(100, Number(req.query.limit || 25)));
    const offset = Math.max(0, Number(req.query.offset || 0));
    const role = String(req.query.role || "all").trim().toLowerCase();
    const q = String(req.query.q || "").trim();

    const filter = {};
    if (role && role !== "all") {
      filter.role = role;
    }
    if (q) {
      const safe = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.$or = [
        { name: { $regex: new RegExp(safe, "i") } },
        { email: { $regex: new RegExp(safe, "i") } },
      ];
    }

    const total = await User.countDocuments(filter);
    const users = await User.find(filter)
      .select("-password")
      .populate("schoolId", "name")
      .sort({ createdAt: -1, _id: -1 })
      .skip(offset)
      .limit(limit);

    res.json({
      items: users,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + users.length < total,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role, schoolId } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: "name, email, password, and role are required." });
    }

    const validRoles = ["student", "teacher", "principal"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: `role must be one of: ${validRoles.join(", ")}` });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: "A user with this email already exists." });

    const user = await User.create({
      name,
      email,
      password,
      role,
      schoolId: schoolId || null,
      isFirstLogin: true,
    });

    res.status(201).json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        schoolId: user.schoolId,
        isFirstLogin: user.isFirstLogin,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const validRoles = ["student", "teacher", "principal"];
    if (!role || !validRoles.includes(role)) {
      return res.status(400).json({ error: `role must be one of: ${validRoles.join(", ")}` });
    }

    const user = await User.findByIdAndUpdate(id, { role }, { new: true }).select("-password");
    if (!user) return res.status(404).json({ error: "User not found." });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const validStatuses = ["active", "inactive"];
    if (!status || !validStatuses.includes(String(status))) {
      return res.status(400).json({ error: `status must be one of: ${validStatuses.join(", ")}` });
    }

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ error: "User not found." });
    if (user.role === "admin") return res.status(403).json({ error: "Cannot change status of an admin user." });

    user.status = status;
    await user.save();

    const safeUser = await User.findById(id).select("-password").populate("schoolId", "name");
    return res.json({ user: safeUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.transferUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { schoolId } = req.body;

    if (!schoolId) return res.status(400).json({ error: "schoolId is required." });

    const school = await School.findById(schoolId);
    if (!school) return res.status(404).json({ error: "Target school not found." });

    const user = await User.findByIdAndUpdate(id, { schoolId }, { new: true })
      .select("-password")
      .populate("schoolId", "name");
    if (!user) return res.status(404).json({ error: "User not found." });

    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ error: "User not found." });
    if (user.role === "admin") return res.status(403).json({ error: "Cannot delete an admin user." });
    await User.findByIdAndDelete(id);
    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ==================== PLATFORM STATS ====================

exports.getPlatformStats = async (req, res) => {
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [totalUsers, totalSchools, activeUsers, roleCounts] = await Promise.all([
      User.countDocuments(),
      School.countDocuments({ status: "active" }),
      User.countDocuments({ lastActivityAt: { $gte: sevenDaysAgo } }),
      User.aggregate([
        { $group: { _id: "$role", count: { $sum: 1 } } },
      ]),
    ]);

    const byRole = {};
    roleCounts.forEach((r) => { byRole[r._id] = r.count; });

    res.json({
      totalUsers,
      totalSchools,
      activeUsers,
      byRole,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ==================== FEATURE TOGGLES ====================

exports.getFeatureToggles = async (req, res) => {
  try {
    let toggles = await FeatureToggle.findOne();
    if (!toggles) {
      toggles = await FeatureToggle.create({});
    }
    res.json({ toggles });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateFeatureToggles = async (req, res) => {
  try {
    const { competitions, rewards } = req.body;
    let toggles = await FeatureToggle.findOne();
    if (!toggles) {
      toggles = new FeatureToggle();
    }
    if (competitions !== undefined) toggles.competitions = competitions;
    if (rewards !== undefined) toggles.rewards = rewards;
    await toggles.save();
    res.json({ toggles });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
