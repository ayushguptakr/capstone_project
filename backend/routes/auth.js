const express = require("express");
const router = express.Router();
const { signup, login, getMe, updateAvatar, updateSkins, setNewPassword } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

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
