const mongoose = require("mongoose");

/**
 * Multi-tenant scope builder.
 * Builds a MongoDB query filter based on the logged-in user's role,
 * ensuring strict school + class isolation.
 *
 * Usage in controllers:
 *   const { buildScope } = require("../middleware/scopeFilter");
 *   const scope = buildScope(req.user);
 *   const tasks = await Task.find({ ...scope });
 *
 * Usage as middleware:
 *   router.get("/tasks", protect, attachScope, getTasksHandler);
 *   // req.scope is now available
 */

function buildScope(user, opts = {}) {
  if (!user) return {};

  // Admin: platform-wide access, no filter
  if (user.role === "admin") return {};

  const scope = {};

  // School isolation (non-negotiable for all non-admin roles)
  if (user.schoolId) {
    scope.schoolId = user.schoolId;
  }

  // Class-level enforcement
  if (!opts.skipClassFilter) {
    if (user.role === "student") {
      // Students see only their own class + unscoped (global/all-class) content
      const classKey = user.classAssigned || user.className || user.class;
      if (classKey) {
        scope.$or = [
          { targetClass: classKey },
          { targetClass: null },
          { targetClass: "" },
          { targetClass: { $exists: false } },
        ];
      }
    }
    // Teachers: class filter is optional per-endpoint (some endpoints show all school data)
    // Principal: sees entire school, no class filter
  }

  return scope;
}

/**
 * Builds a content-visibility filter that includes global (isGlobal: true)
 * content alongside school-specific content.
 */
function buildContentScope(user, opts = {}) {
  if (!user) return {};
  if (user.role === "admin") return {};

  const base = buildScope(user, opts);

  // For content queries (quizzes, tasks): show global + school content
  if (user.schoolId) {
    // Override the simple schoolId with an $or that includes global content
    delete base.schoolId;
    const schoolCondition = {
      $or: [
        { isGlobal: true },
        { schoolId: user.schoolId },
      ],
    };

    // Merge with any existing $or (from class filter)
    if (base.$or) {
      return { $and: [schoolCondition, { $or: base.$or }] };
    }
    return { ...base, ...schoolCondition };
  }

  return base;
}

/**
 * Express middleware that attaches scope to req.scope
 */
function attachScope(req, res, next) {
  req.scope = buildScope(req.user);
  req.contentScope = buildContentScope(req.user);
  next();
}

module.exports = { buildScope, buildContentScope, attachScope };
