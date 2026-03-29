const express = require("express");
const router = express.Router();
const { signup, login, getMe, updateAvatar } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

// Signup route
router.post("/signup", signup);

// Login route
router.post("/login", login);
router.get("/me", protect, getMe);
router.put("/avatar", protect, updateAvatar);

module.exports = router;
