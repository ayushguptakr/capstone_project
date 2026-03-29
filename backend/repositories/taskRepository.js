const Task = require("../models/Task");

async function findById(id) {
  return Task.findById(id).lean();
}

async function findByIdWithImpact(id) {
  return Task.findById(id).select("title points impact_model category difficulty").lean();
}

async function findTasksByCategory(category) {
  return Task.find({ category }).select("title description points impact_model category difficulty").lean();
}

async function findAllCategories() {
  return Task.distinct("category");
}

async function findByIds(ids) {
  return Task.find({ _id: { $in: ids } }).lean();
}

module.exports = {
  findById,
  findByIdWithImpact,
  findTasksByCategory,
  findAllCategories,
  findByIds,
};
