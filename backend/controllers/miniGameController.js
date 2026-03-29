const { MiniGame, GameScore } = require("../models/MiniGame");
const adaptiveDifficultyEngine = require("../services/adaptiveDifficultyEngine");
const gamificationService = require("../services/gamificationService");

const GAME_ALIAS = {
  "waste-sorting": "waste sorting",
  "eco-memory": "eco memory",
  "climate-hero": "climate hero",
  "eco-trivia-race": "eco trivia race",
  "trivia-race": "eco trivia race",
  "plant-growth": "plant growth",
};

// Get all available mini-games
const getMiniGames = async (req, res) => {
  try {
    const games = await MiniGame.find({ isActive: true });
    res.json(games);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Submit game score
const submitGameScore = async (req, res) => {
  try {
    const { gameId, score, timeSpent } = req.body;
    const studentId = req.user.id;

    let game = await MiniGame.findById(gameId);
    if (!game && typeof gameId === "string") {
      const alias = GAME_ALIAS[gameId.toLowerCase()] || gameId;
      game = await MiniGame.findOne({
        name: { $regex: new RegExp(alias.replace(/\s+/g, ".*"), "i") },
        isActive: true,
      });
    }
    if (!game) {
      return res.status(404).json({ message: "Game not found" });
    }

    // Calculate points based on score and difficulty
    let pointsEarned = Math.floor((score * game.pointsReward) / 100);
    if (game.difficulty === "medium") pointsEarned *= 1.5;
    if (game.difficulty === "hard") pointsEarned *= 2;

    // Apply adaptive reward multiplier (based on category performance)
    let adjustments = null;
    try {
      adjustments = await adaptiveDifficultyEngine.computeAdjustments(studentId, game.category);
      if (adjustments?.rewardMultiplier) {
        pointsEarned = Math.floor(pointsEarned * adjustments.rewardMultiplier);
      }
    } catch (e) {
      // ignore adaptive failures
    }

    const gameScore = new GameScore({
      student: studentId,
      game: game._id,
      score,
      timeSpent,
      pointsEarned
    });

    await gameScore.save();

    // Update adaptive profile with retry frequency (best-effort)
    try {
      await adaptiveDifficultyEngine.updateFromGameScore(studentId, game, gameScore);
      adjustments = adjustments || (await adaptiveDifficultyEngine.computeAdjustments(studentId, game.category));
    } catch (e) {
      // ignore
    }

    // Award XP through central service for level/streak consistency.
    await gamificationService.awardPoints({
      userId: studentId,
      points: pointsEarned,
      source: "game",
      sourceRef: String(game._id),
      idempotencyKey: `game-score:${gameScore._id}`,
      metadata: { rawScore: score },
    });

    res.json({
      message: "Score submitted successfully",
      pointsEarned,
      totalScore: score,
      adaptive: adjustments
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get student's game history
const getGameHistory = async (req, res) => {
  try {
    const history = await GameScore.find({ student: req.user.id })
      .populate("game", "name type category")
      .sort({ createdAt: -1 })
      .limit(20);
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getMiniGames,
  submitGameScore,
  getGameHistory
};