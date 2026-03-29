const EcoImpactLog = require("../models/EcoImpactLog");
const mongoose = require("mongoose");

async function create(data) {
  return EcoImpactLog.create(data);
}

async function findBySubmission(submissionId) {
  return EcoImpactLog.findOne({ submission: submissionId });
}

async function findByStudent(studentId, options = {}) {
  const query = { student: studentId };
  if (options.startDate) query.createdAt = query.createdAt || {};
  if (options.startDate) query.createdAt.$gte = options.startDate;
  if (options.endDate) query.createdAt = query.createdAt || {};
  if (options.endDate) query.createdAt.$lte = options.endDate;
  return EcoImpactLog.find(query).sort({ createdAt: -1 }).lean();
}

async function aggregateByStudent(school = null, startDate = null, endDate = null) {
  const match = {};
  if (school) match.school = school;
  if (startDate || endDate) {
    match.createdAt = {};
    if (startDate) match.createdAt.$gte = new Date(startDate);
    if (endDate) match.createdAt.$lte = new Date(endDate);
  }
  const pipeline = [
    { $match: Object.keys(match).length ? match : { _id: { $exists: true } } },
    {
      $group: {
        _id: "$student",
        totalCo2Reduced: { $sum: "$co2Reduced" },
        totalWaterSaved: { $sum: "$waterSaved" },
        totalWasteDiverted: { $sum: "$wasteDiverted" },
        totalEnergySaved: { $sum: "$energySaved" },
        totalImpactValue: { $sum: "$impactValue" },
        totalPsiContribution: { $sum: "$psiContribution" },
        count: { $sum: 1 },
      },
    },
    { $sort: { totalImpactValue: -1 } },
  ];
  return EcoImpactLog.aggregate(pipeline);
}

async function aggregateBySchool(startDate = null, endDate = null) {
  const match = {};
  if (startDate || endDate) {
    match.createdAt = {};
    if (startDate) match.createdAt.$gte = new Date(startDate);
    if (endDate) match.createdAt.$lte = new Date(endDate);
  }
  const pipeline = [
    { $match: Object.keys(match).length ? match : { _id: { $exists: true } } },
    {
      $group: {
        _id: "$school",
        totalCo2Reduced: { $sum: "$co2Reduced" },
        totalWaterSaved: { $sum: "$waterSaved" },
        totalWasteDiverted: { $sum: "$wasteDiverted" },
        totalEnergySaved: { $sum: "$energySaved" },
        totalImpactValue: { $sum: "$impactValue" },
        studentCount: { $addToSet: "$student" },
        count: { $sum: 1 },
      },
    },
    { $addFields: { uniqueStudents: { $size: "$studentCount" } } },
    { $sort: { totalImpactValue: -1 } },
  ];
  return EcoImpactLog.aggregate(pipeline);
}

async function aggregateByClass(school, startDate = null, endDate = null) {
  const match = { school };
  if (startDate || endDate) {
    match.createdAt = {};
    if (startDate) match.createdAt.$gte = new Date(startDate);
    if (endDate) match.createdAt.$lte = new Date(endDate);
  }
  const pipeline = [
    { $match: match },
    {
      $group: {
        _id: { school: "$school", className: "$className" },
        totalCo2Reduced: { $sum: "$co2Reduced" },
        totalWaterSaved: { $sum: "$waterSaved" },
        totalWasteDiverted: { $sum: "$wasteDiverted" },
        totalEnergySaved: { $sum: "$energySaved" },
        totalImpactValue: { $sum: "$impactValue" },
        count: { $sum: 1 },
      },
    },
    { $sort: { "totalImpactValue": -1 } },
  ];
  return EcoImpactLog.aggregate(pipeline);
}

async function aggregateByCampaign(campaignId, startDate = null, endDate = null) {
  const match = { campaignId: new mongoose.Types.ObjectId(campaignId) };
  if (startDate || endDate) {
    match.createdAt = {};
    if (startDate) match.createdAt.$gte = new Date(startDate);
    if (endDate) match.createdAt.$lte = new Date(endDate);
  }
  return EcoImpactLog.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        totalCo2Reduced: { $sum: "$co2Reduced" },
        totalWaterSaved: { $sum: "$waterSaved" },
        totalWasteDiverted: { $sum: "$wasteDiverted" },
        totalEnergySaved: { $sum: "$energySaved" },
        totalImpactValue: { $sum: "$impactValue" },
        count: { $sum: 1 },
      },
    },
  ]);
}

/** Monthly trend: group by year-month. */
async function monthlyTrend(school = null, startDate, endDate) {
  const match = {};
  if (school) match.school = school;
  if (startDate) match.createdAt = match.createdAt || {};
  if (startDate) match.createdAt.$gte = new Date(startDate);
  if (endDate) match.createdAt = match.createdAt || {};
  if (endDate) match.createdAt.$lte = new Date(endDate);
  return EcoImpactLog.aggregate([
    { $match: Object.keys(match).length ? match : { _id: { $exists: true } } },
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
        },
        co2Reduced: { $sum: "$co2Reduced" },
        waterSaved: { $sum: "$waterSaved" },
        wasteDiverted: { $sum: "$wasteDiverted" },
        energySaved: { $sum: "$energySaved" },
        count: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);
}

/** Category-wise impact: need task category. Join with tasks. */
async function categoryWiseImpact(school = null, startDate = null, endDate = null) {
  const match = {};
  if (school) match.school = school;
  if (startDate || endDate) {
    match.createdAt = {};
    if (startDate) match.createdAt.$gte = new Date(startDate);
    if (endDate) match.createdAt.$lte = new Date(endDate);
  }
  return EcoImpactLog.aggregate([
    { $match: Object.keys(match).length ? match : { _id: { $exists: true } } },
    { $lookup: { from: "tasks", localField: "task", foreignField: "_id", as: "taskDoc" } },
    { $unwind: "$taskDoc" },
    {
      $group: {
        _id: "$taskDoc.category",
        totalCo2Reduced: { $sum: "$co2Reduced" },
        totalWaterSaved: { $sum: "$waterSaved" },
        totalWasteDiverted: { $sum: "$wasteDiverted" },
        totalEnergySaved: { $sum: "$energySaved" },
        count: { $sum: 1 },
      },
    },
    { $sort: { totalCo2Reduced: -1 } },
  ]);
}

module.exports = {
  create,
  findBySubmission,
  findByStudent,
  aggregateByStudent,
  aggregateBySchool,
  aggregateByClass,
  aggregateByCampaign,
  monthlyTrend,
  categoryWiseImpact,
};
