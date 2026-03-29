const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { getMyGamification, syncMyActivity } = require("../controllers/gamificationController");

const router = express.Router();

router.get("/me", protect, getMyGamification);
router.post("/sync-activity", protect, syncMyActivity);

module.exports = router;
