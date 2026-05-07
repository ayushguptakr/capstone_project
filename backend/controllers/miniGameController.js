const { MiniGame, GameScore } = require("../models/MiniGame");
const GameRun = require("../models/GameRun");
const adaptiveDifficultyEngine = require("../services/adaptiveDifficultyEngine");
const gamificationService = require("../services/gamificationService");
const User = require("../models/User");
const { GAME_THRESHOLDS, calculateStars, updatePlayStreak } = require("../config/gameThresholds");
const jwt = require("jsonwebtoken");
const { randomUUID } = require("crypto");
const XPEvent = require("../models/XPEvent");
const mongoose = require("mongoose");

function getMiniGameJwtSecret() {
  if (process.env.JWT_SECRET) return process.env.JWT_SECRET;
  if (process.env.NODE_ENV !== "production") return "ecoquest-dev-minigame-secret";
  return null;
}

function startOfDay(dateValue) {
  const d = new Date(dateValue || Date.now());
  d.setHours(0, 0, 0, 0);
  return d;
}

const GAME_ALIAS = {
  "waste-sorting": "waste sorting",
  "eco-memory": "eco memory",
  "climate-hero": "climate hero",
  "eco-trivia-race": "eco trivia race",
  "trivia-race": "eco trivia race",
  "plant-growth": "plant growth",
  "eco-habit": "eco habit",
  "river-cleanup-rush": "river cleanup rush",
  "solar-sprint": "solar sprint",
  "eco-quiz-blaster": "eco quiz blaster",
  "power-planner": "power planner",
  "ecosystem-balance": "ecosystem balance",
  "carbon-choices": "carbon choices",
  "water-cycle-lab": "water cycle lab",
};

function resolveThresholdKeyFromGameId(gameId, gameName) {
  let thresholdId = String(gameId || "").toLowerCase();
  if (GAME_THRESHOLDS[thresholdId]) return thresholdId;
  const reverseAlias = Object.keys(GAME_ALIAS).find(
    (k) => GAME_ALIAS[k] === String(gameName || "").toLowerCase()
  );
  if (reverseAlias && GAME_THRESHOLDS[reverseAlias]) return reverseAlias;
  return thresholdId;
}

async function resolveGame(gameId) {
  let game = null;
  if (typeof gameId === "string" && mongoose.Types.ObjectId.isValid(gameId)) {
    game = await MiniGame.findById(gameId);
  }
  if (!game && typeof gameId === "string") {
    const alias = GAME_ALIAS[gameId.toLowerCase()] || gameId;
    game = await MiniGame.findOne({
      name: { $regex: new RegExp(alias.replace(/\s+/g, ".*"), "i") },
      isActive: true,
    });
    if (!game) {
      const normalizedAlias = alias.toLowerCase().replace(/[^a-z0-9]/g, "");
      const activeGames = await MiniGame.find({ isActive: true }).select("name");
      const fuzzy = activeGames.find((g) =>
        String(g.name || "").toLowerCase().replace(/[^a-z0-9]/g, "").includes(normalizedAlias)
      );
      if (fuzzy) {
        game = await MiniGame.findById(fuzzy._id);
      }
    }
  }
  return game;
}

// Get all available mini-games
const getMiniGames = async (req, res) => {
  try {
    const games = await MiniGame.find({ isActive: true });
    res.json(games);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Start a server-verified run (anti-replay token + runId)
const startGameRun = async (req, res) => {
  try {
    const { gameId, level } = req.body;
    const studentId = req.user.id;
    const levelPlayed = Math.max(1, Math.min(3, parseInt(level, 10) || 1));

    const game = await resolveGame(gameId);
    if (!game) return res.status(404).json({ message: "Game not found" });

    const runId = randomUUID();
    await GameRun.create({ runId, student: studentId, game: game._id, level: levelPlayed, consumedAt: null });

    const thresholdKey = resolveThresholdKeyFromGameId(gameId, game.name);
    const config = GAME_THRESHOLDS[thresholdKey]?.[levelPlayed];
    const maxScore = config?.maxScore ?? 100; // safe fallback cap if thresholds missing
    const minSeconds = Number(process.env.GAME_MIN_SECONDS || 12);
    const jwtSecret = getMiniGameJwtSecret();
    if (!jwtSecret) {
      return res.status(500).json({ message: "Server configuration error: JWT secret is missing" });
    }

    const token = jwt.sign(
      { runId, studentId: String(studentId), game: String(game._id), level: levelPlayed, maxScore, minSeconds },
      jwtSecret,
      { expiresIn: "10m" }
    );

    res.json({ runId, runToken: token, maxScore, minSeconds, level: levelPlayed });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      requestId: req.requestId,
      ...(process.env.NODE_ENV !== "production" ? { stack: error.stack } : {}),
    });
  }
};

// Submit game score
const submitGameScore = async (req, res) => {
  try {
    const { gameId, score, timeSpent, runId, runToken } = req.body;
    const studentId = req.user.id;

    if (!runId || !runToken) {
      return res.status(400).json({ message: "runId and runToken are required" });
    }

    let decoded;
    try {
      const jwtSecret = getMiniGameJwtSecret();
      if (!jwtSecret) {
        return res.status(500).json({ message: "Server configuration error: JWT secret is missing" });
      }
      decoded = jwt.verify(runToken, jwtSecret);
    } catch (e) {
      return res.status(401).json({ message: "Invalid or expired runToken" });
    }

    if (decoded.runId !== runId || decoded.studentId !== String(studentId)) {
      return res.status(403).json({ message: "Run token does not match this user/run" });
    }

    // Enforce single-consume
    const run = await GameRun.findOne({ runId, student: studentId });
    if (!run) return res.status(400).json({ message: "Unknown runId" });
    if (run.consumedAt) return res.status(400).json({ message: "Run already submitted" });

    // Minimum play time gate (client-reported + server-observed run age)
    const minSeconds = Math.max(0, Number(decoded.minSeconds ?? process.env.GAME_MIN_SECONDS ?? 12));
    const clientSeconds = Number(timeSpent ?? 0);
    const serverSeconds = Math.floor((Date.now() - new Date(run.createdAt).getTime()) / 1000);
    if (minSeconds > 0 && (clientSeconds < minSeconds || serverSeconds < minSeconds)) {
      return res.status(400).json({ message: `Playtime too short (min ${minSeconds}s)` });
    }

    const game = await resolveGame(gameId);
    if (!game) {
      return res.status(404).json({ message: "Game not found" });
    }
    if (String(decoded.game) !== String(game._id)) {
      return res.status(403).json({ message: "Run token does not match this game" });
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

    const levelPlayed = Math.max(1, Math.min(3, parseInt(decoded.level, 10) || 1));
    let thresholdId = resolveThresholdKeyFromGameId(gameId, game.name);

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

    const maxAllowedScore = config?.maxScore ?? Number(decoded.maxScore ?? 100);
    if (typeof score !== "number" || Number.isNaN(score) || score < 0) {
      return res.status(400).json({ message: "Invalid score" });
    }
    if (score > maxAllowedScore) {
      return res.status(400).json({ message: "Invalid score - exceeds maximum possible for this level" });
    }

    if (config) {
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

    // Consume run (best-effort)
    run.consumedAt = new Date();
    await run.save();

    let capInfo = null;

    // Daily cap for game XP
    const cap = Number(process.env.GAME_DAILY_XP_CAP ?? 120);
    if (cap > 0) {
      const today = startOfDay(new Date());
      const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
      const agg = await XPEvent.aggregate([
        { $match: { user: run.student, source: "game", occurredAt: { $gte: today, $lt: tomorrow } } },
        { $group: { _id: null, total: { $sum: "$points" } } },
      ]);
      const earnedToday = Number(agg?.[0]?.total ?? 0);
      if (earnedToday >= cap) {
        pointsEarned = 0;
        capInfo = { type: "daily", cap, earned: earnedToday, remaining: 0 };
      } else if (earnedToday + pointsEarned > cap) {
        pointsEarned = Math.max(0, cap - earnedToday);
        capInfo = { type: "daily", cap, earned: earnedToday, remaining: Math.max(0, cap - earnedToday) };
      }
    }

    // Per-game daily cap (prevents grinding a single easy game)
    const perGameCap = Number(process.env.GAME_PER_GAME_DAILY_XP_CAP ?? 40);
    if (perGameCap > 0 && pointsEarned > 0) {
      const today = startOfDay(new Date());
      const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
      const gameAgg = await XPEvent.aggregate([
        {
          $match: {
            user: run.student,
            source: "game",
            sourceRef: String(game._id),
            occurredAt: { $gte: today, $lt: tomorrow },
          },
        },
        { $group: { _id: null, total: { $sum: "$points" } } },
      ]);
      const earnedForGameToday = Number(gameAgg?.[0]?.total ?? 0);
      if (earnedForGameToday >= perGameCap) {
        pointsEarned = 0;
        capInfo = { type: "perGameDaily", cap: perGameCap, earned: earnedForGameToday, remaining: 0 };
      } else if (earnedForGameToday + pointsEarned > perGameCap) {
        pointsEarned = Math.max(0, perGameCap - earnedForGameToday);
        capInfo = { type: "perGameDaily", cap: perGameCap, earned: earnedForGameToday, remaining: Math.max(0, perGameCap - earnedForGameToday) };
      }
    }

    // Award XP through central service for level/streak consistency.
    if (pointsEarned > 0) {
      await gamificationService.awardPoints({
        userId: studentId,
        points: pointsEarned,
        source: "game",
        sourceRef: String(game._id),
        idempotencyKey: `game-run:${runId}`,
        metadata: { rawScore: score, levelPlayed, timeSpent: clientSeconds, serverSeconds },
      });
    }

    res.json({
      message: "Score submitted successfully",
      pointsEarned,
      totalScore: score,
      adaptive: adjustments,
      mastery: masteryData,
      capInfo,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      requestId: req.requestId,
      ...(process.env.NODE_ENV !== "production" ? { stack: error.stack } : {}),
    });
  }
};

// Get student's game history
const getGameHistory = async (req, res) => {
  try {
    const limit = Math.max(1, Math.min(100, Number(req.query.limit || 20)));
    const offset = Math.max(0, Number(req.query.offset || 0));
    const filter = { student: req.user.id };
    const total = await GameScore.countDocuments(filter);
    const history = await GameScore.find(filter)
      .populate("game", "name type category")
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit);
    res.json({
      items: history,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + history.length < total,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getMiniGames,
  startGameRun,
  submitGameScore,
  getGameHistory
};