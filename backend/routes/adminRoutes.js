const express = require("express");
const router = express.Router();
const {
  getSchools,
  createSchool,
  updateSchool,
  deleteSchool,
  assignPrincipal,
  getUsers,
  createUser,
  updateUserRole,
  transferUser,
  deleteUser,
  getPlatformStats,
  getFeatureToggles,
  updateFeatureToggles,
} = require("../controllers/adminController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

// All admin routes are protected for 'admin' role
router.use(protect);
router.use(authorizeRoles("admin"));

// School management
router.get("/schools", getSchools);
router.post("/schools", createSchool);
router.put("/schools/:id", updateSchool);
router.delete("/schools/:id", deleteSchool);
router.post("/schools/assign", assignPrincipal);

// User management
router.get("/users", getUsers);
router.post("/users", createUser);
router.put("/users/:id/role", updateUserRole);
router.put("/users/:id/transfer", transferUser);
router.delete("/users/:id", deleteUser);

// Platform stats
router.get("/stats", getPlatformStats);

// Feature toggles
router.get("/feature-toggles", getFeatureToggles);
router.put("/feature-toggles", updateFeatureToggles);

module.exports = router;
