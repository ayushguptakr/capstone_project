const express = require("express");
const router = express.Router();
const { signup, login, getMe, updateAvatar, updateSkins, setNewPassword, getPublicSchools } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

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

module.exports = router;
