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
router.get("/aggregate/student", protect, authorizeRoles("teacher", "principal", "admin"), getStudentAggregate);
router.get("/aggregate/school", protect, authorizeRoles("principal", "admin"), getSchoolAggregate);
router.get("/aggregate/class", protect, authorizeRoles("teacher", "principal", "admin"), getClassAggregate);
router.post("/refresh-ranking/:studentId", protect, authorizeRoles("teacher", "admin"), refreshRanking);

module.exports = router;
