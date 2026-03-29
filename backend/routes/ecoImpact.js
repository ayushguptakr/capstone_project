const express = require("express");
const router = express.Router();
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const {
  getStudentImpact,
  getStudentAggregate,
  getSchoolAggregate,
  getClassAggregate,
  refreshRanking,
} = require("../controllers/ecoImpactController");

router.get("/student/:studentId", protect, getStudentImpact);
router.get("/aggregate/student", protect, getStudentAggregate);
router.get("/aggregate/school", protect, getSchoolAggregate);
router.get("/aggregate/class", protect, getClassAggregate);
router.post("/refresh-ranking/:studentId", protect, authorizeRoles("teacher", "admin"), refreshRanking);

module.exports = router;
