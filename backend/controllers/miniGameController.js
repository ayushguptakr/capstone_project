const { MiniGame, GameScore } = require("../models/MiniGame");
const adaptiveDifficultyEngine = require("../services/adaptiveDifficultyEngine");
const gamificationService = require("../services/gamificationService");
const User = require("../models/User");
const { GAME_THRESHOLDS, calculateStars, updatePlayStreak } = require("../config/gameThresholds");

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

    const levelPlayed = parseInt(req.body.level) || 1;
    let thresholdId = gameId.toLowerCase();
    if (!GAME_THRESHOLDS[thresholdId]) {
      // Try to find the correct key if alias was used
      const reverseAlias = Object.keys(GAME_ALIAS).find(k => GAME_ALIAS[k] === game.name.toLowerCase());
      if (reverseAlias && GAME_THRESHOLDS[reverseAlias]) thresholdId = reverseAlias;
    }

    const config = GAME_THRESHOLDS[thresholdId]?.[levelPlayed];
    let starsEarned = 0;
    let nextStarDelta = 0;
    let newBest = 0;
    
    // Default response fields
    const masteryData = {
      starsEarned: 0,
      nextStarDelta: 0,
      newBest: 0,
      newUnlockedLevel: null
    };

    if (config) {
      if (score > config.maxScore) {
        return res.status(400).json({ message: "Invalid score - exceeds maximum possible for this level" });
      }
      
      starsEarned = calculateStars(score, config.thresholds);
      
      // Calculate delta for near miss
      if (starsEarned < 3) {
        masteryData.nextStarDelta = config.thresholds[starsEarned] - score;
      }
      masteryData.starsEarned = starsEarned;

      // Update User progress deeply
      const user = await User.findById(studentId);
      const progressMap = user.miniGameProgress || new Map();
      let gameProgress = progressMap.get(thresholdId) || {
        unlockedLevel: 1,
        scores: [0, 0, 0],
        stars: [0, 0, 0],
        attempts: 0,
        lastPlayedAt: null,
        playStreak: 0
      };

      // Security check: Don't allow playing beyond unlocked
      if (levelPlayed > gameProgress.unlockedLevel) {
        return res.status(403).json({ message: "Level locked" });
      }

      gameProgress.attempts += 1;
      gameProgress.playStreak = updatePlayStreak(gameProgress.lastPlayedAt, new Date(), gameProgress.playStreak);
      gameProgress.lastPlayedAt = new Date();

      // Check for new best
      const oldScore = gameProgress.scores[levelPlayed - 1] || 0;
      if (score > oldScore) {
        newBest = score - oldScore;
        masteryData.newBest = newBest;
        gameProgress.scores[levelPlayed - 1] = score;
      }
      
      const oldStars = gameProgress.stars[levelPlayed - 1] || 0;
      if (starsEarned > oldStars) {
        gameProgress.stars[levelPlayed - 1] = starsEarned;
      }

      // Check level unlock condition (1 star is required to unlock the next level)
      if (starsEarned >= 1 && levelPlayed === gameProgress.unlockedLevel && levelPlayed < 3) {
        gameProgress.unlockedLevel += 1;
        masteryData.newUnlockedLevel = gameProgress.unlockedLevel;
      }

      progressMap.set(thresholdId, gameProgress);
      user.miniGameProgress = progressMap;
      await user.save();
    }

    // Award XP through central service for level/streak consistency.
    await gamificationService.awardPoints({
      userId: studentId,
      points: pointsEarned,
      source: "game",
      sourceRef: String(game._id),
      idempotencyKey: `game-score:${gameScore._id}`,
      metadata: { rawScore: score, levelPlayed },
    });

    res.json({
      message: "Score submitted successfully",
      pointsEarned,
      totalScore: score,
      adaptive: adjustments,
      mastery: masteryData
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