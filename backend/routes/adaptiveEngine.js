const express = require("express");
const router = express.Router();
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const { getMyAdaptiveState } = require("../controllers/adaptiveEngineController");

router.get("/me", protect, authorizeRoles("student"), getMyAdaptiveState);

module.exports = router;

