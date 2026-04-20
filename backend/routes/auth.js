const express = require("express");
const router = express.Router();
const { signup, login, getMe, updateAvatar, updateSkins, setNewPassword, getPublicSchools, forgotPassword, resetPassword } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const rateLimit = require("express-rate-limit");

const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, 
  max: 3,
  message: { message: "Too many reset attempts, please try again after an hour" },
  standardHeaders: true,
  legacyHeaders: false,
});

// Public schools for signup dropdown
router.get("/schools", getPublicSchools);

// Signup route
router.post("/signup", signup);

// Login route
router.post("/login", login);
router.get("/me", protect, getMe);
router.put("/avatar", protect, updateAvatar);
router.put("/skins", protect, updateSkins);

// First-login password reset
router.post("/set-password", protect, setNewPassword);

// Auth UX System Password Recovery
router.post("/forgot-password", forgotPasswordLimiter, forgotPassword);
router.post("/reset-password/:token", resetPassword);

module.exports = router;
