/**
 * Input validation for eco-impact and analytics endpoints.
 */
function validatePagination(query) {
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 10));
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const skip = (page - 1) * limit;
  return { limit, page, skip };
}

function validateDateRange(query) {
  let startDate = query.startDate ? new Date(query.startDate) : null;
  let endDate = query.endDate ? new Date(query.endDate) : null;
  if (startDate && isNaN(startDate.getTime())) startDate = null;
  if (endDate && isNaN(endDate.getTime())) endDate = null;
  return { startDate, endDate };
}

function validateSchoolFilter(query) {
  const school = typeof query.school === "string" ? query.school.trim() : null;
  return school || null;
}

function validateMongoId(id, name = "Id") {
  const mongoose = require("mongoose");
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    const { ValidationError } = require("../utils/errors");
    throw new ValidationError(`Invalid ${name}`);
  }
  return id;
}

module.exports = {
  validatePagination,
  validateDateRange,
  validateSchoolFilter,
  validateMongoId,
};
