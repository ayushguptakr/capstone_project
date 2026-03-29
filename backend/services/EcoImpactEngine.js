/**
 * Eco-Impact Quantification Engine
 * Converts approved eco-task submissions into measurable environmental impact
 * and stores results in eco_impact_logs. Computes PSI contribution.
 */
const ecoImpactLogRepository = require("../repositories/ecoImpactLogRepository");
const taskRepository = require("../repositories/taskRepository");
const regionalCoefficientRepository = require("../repositories/regionalCoefficientRepository");
const {
  computePSIContribution,
  difficultyWeight,
  compositeImpactValue,
  impactToGreenCredits,
} = require("../utils/formulas");

/**
 * Resolve impact coefficients for a task (task.impact_model or regional default).
 * @param {Object} task - task document with optional impact_model, category
 * @param {string} school - for region lookup
 */
async function getCoefficients(task, school = "") {
  if (task && task.impact_model && typeof task.impact_model.co2_per_unit === "number") {
    return {
      co2_per_unit: task.impact_model.co2_per_unit,
      water_per_unit: task.impact_model.water_per_unit || 0,
      waste_per_unit: task.impact_model.waste_per_unit || 0,
      energy_per_unit: task.impact_model.energy_per_unit || 0,
      impact_weight: task.impact_model.impact_weight || 1,
    };
  }
  const regional = await regionalCoefficientRepository.getForRegionAndCategory(
    school,
    task?.category || ""
  );
  return regional
    ? {
        co2_per_unit: regional.co2_per_unit || 0,
        water_per_unit: regional.water_per_unit || 0,
        waste_per_unit: regional.waste_per_unit || 0,
        energy_per_unit: regional.energy_per_unit || 0,
        impact_weight: regional.impact_weight || 1,
      }
    : {
        co2_per_unit: 0,
        water_per_unit: 0,
        waste_per_unit: 0,
        energy_per_unit: 0,
        impact_weight: 1,
      };
}

/**
 * Compute impact for one approved submission.
 * @param {Object} submission - { _id, task, student, school?, className? }
 * @param {Object} task - task with impact_model, category, difficulty
 * @param {number} quantity - units of action (default 1)
 * @param {number} consistencyMultiplier - optional
 * @returns {Promise<Object>} created EcoImpactLog document
 */
async function computeAndLogImpact(submission, task, quantity = 1, consistencyMultiplier = 1) {
  const taskId = submission.task && submission.task._id ? submission.task._id : submission.task;
  const studentId = submission.student && submission.student._id ? submission.student._id : submission.student;
  const school = submission.student?.school || submission.school || "";
  const className = submission.student?.className || submission.className || "";

  const taskDoc =
    task && task._id
      ? task
      : await taskRepository.findByIdWithImpact(taskId);
  if (!taskDoc) {
    throw new Error("Task not found for impact computation");
  }

  const coeff = await getCoefficients(taskDoc, school);
  const qty = Math.max(0.1, Number(quantity) || 1);
  const diffW = difficultyWeight(taskDoc.difficulty);

  const co2Reduced = (coeff.co2_per_unit || 0) * qty;
  const waterSaved = (coeff.water_per_unit || 0) * qty;
  const wasteDiverted = (coeff.waste_per_unit || 0) * qty;
  const energySaved = (coeff.energy_per_unit || 0) * qty;

  const impactValue = compositeImpactValue(
    co2Reduced,
    waterSaved,
    wasteDiverted,
    energySaved,
    coeff.impact_weight
  );
  const psiContribution = computePSIContribution(impactValue, consistencyMultiplier, diffW);

  const logEntry = await ecoImpactLogRepository.create({
    submission: submission._id,
    task: taskDoc._id,
    student: studentId,
    school,
    className,
    co2Reduced,
    waterSaved,
    wasteDiverted,
    energySaved,
    impactValue,
    psiContribution,
    consistencyMultiplier,
    difficultyWeight: diffW,
    quantity: qty,
  });

  return logEntry;
}

/**
 * Convert impact to green credits (for bonus feature).
 */
function computeGreenCreditsForImpact(co2Reduced, waterSaved, wasteDiverted, energySaved) {
  return impactToGreenCredits(co2Reduced, waterSaved, wasteDiverted, energySaved);
}

module.exports = {
  getCoefficients,
  computeAndLogImpact,
  computeGreenCreditsForImpact,
};
