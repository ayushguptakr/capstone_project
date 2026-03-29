const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { getBalance, redeem, getSustainabilityReport } = require("../controllers/greenCreditsController");

router.get("/balance", protect, getBalance);
router.post("/redeem", protect, redeem);
router.get("/report", protect, getSustainabilityReport);

module.exports = router;
