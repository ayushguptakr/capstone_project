const Challenge = require("../models/Challenge");
const User = require("../models/User");
const QuizAttempt = require("../models/QuizAttempt");
const Submission = require("../models/Submission");

// Get active challenges
const getChallenges = async (req, res) => {
  try {
    const now = new Date();
    const challenges = await Challenge.find({
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now }
    }).populate("createdBy", "name");
    
    res.json(challenges);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Join a challenge
const joinChallenge = async (req, res) => {
  try {
    const { challengeId } = req.params;
    const studentId = req.user.id;

    const challenge = await Challenge.findById(challengeId);
    if (!challenge || !challenge.isActive) {
      return res.status(404).json({ message: "Challenge not found" });
    }

    if (challenge.participants.includes(studentId)) {
      return res.status(400).json({ message: "Already joined this challenge" });
    }

    await Challenge.findByIdAndUpdate(challengeId, {
      $push: { participants: studentId }
    });

    res.json({ message: "Successfully joined challenge" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Check challenge progress
const getChallengeProgress = async (req, res) => {
  try {
    const { challengeId } = req.params;
    const studentId = req.user.id;

    const challenge = await Challenge.findById(challengeId);
    if (!challenge) {
      return res.status(404).json({ message: "Challenge not found" });
    }

    // Calculate student's progress
    const startDate = challenge.startDate;
    const endDate = challenge.endDate;

    const quizCount = await QuizAttempt.countDocuments({
      student: studentId,
      createdAt: { $gte: startDate, $lte: endDate }
    });

    const taskCount = await Submission.countDocuments({
      student: studentId,
      status: "approved",
      createdAt: { $gte: startDate, $lte: endDate }
    });

    const pointsEarned = await QuizAttempt.aggregate([
      {
        $match: {
          student: studentId,
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      { $group: { _id: null, total: { $sum: "$totalScore" } } }
    ]);

    const progress = {
      quizzesCompleted: quizCount,
      tasksCompleted: taskCount,
      pointsEarned: pointsEarned[0]?.total || 0,
      requirements: challenge.requirements,
      isCompleted: (
        quizCount >= challenge.requirements.quizzesCompleted &&
        taskCount >= challenge.requirements.tasksCompleted &&
        (pointsEarned[0]?.total || 0) >= challenge.requirements.pointsEarned
      )
    };

    res.json(progress);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create challenge (admin/teacher)
const createChallenge = async (req, res) => {
  try {
    const challenge = new Challenge({
      ...req.body,
      createdBy: req.user.id
    });
    
    await challenge.save();
    res.status(201).json({ message: "Challenge created successfully", challenge });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getChallenges,
  joinChallenge,
  getChallengeProgress,
  createChallenge
};