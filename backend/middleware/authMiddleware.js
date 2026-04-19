const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id).select("-password");

      return next();
    } catch (err) {
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }
};

// -------------------- FIRST-LOGIN ENFORCEMENT --------------------
// Blocks access to any protected route except /api/auth/set-password
// when the user hasn't changed their temporary password yet.
exports.requirePasswordSet = (req, res, next) => {
  if (req.user && req.user.isFirstLogin === true) {
    // Allow the set-password endpoint through
    if (req.originalUrl.includes("/api/auth/set-password")) {
      return next();
    }
    return res.status(403).json({
      message: "You must set a new password before accessing the platform.",
      requirePasswordChange: true,
    });
  }
  next();
};

// Role-based authorization
exports.authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied: insufficient permissions" });
    }
    next();
  };
};

// Alternative authorize function for compatibility
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied: insufficient permissions" });
    }
    next();
  };
};
