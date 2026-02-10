const { MiniGame, GameScore } = require("../models/MiniGame");
const User = require("../models/User");

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

    const game = await MiniGame.findById(gameId);
    if (!game) {
      return res.status(404).json({ message: "Game not found" });
    }

    // Calculate points based on score and difficulty
    let pointsEarned = Math.floor(score * game.pointsReward / 100);
    if (game.difficulty === "medium") pointsEarned *= 1.5;
    if (game.difficulty === "hard") pointsEarned *= 2;

    const gameScore = new GameScore({
      student: studentId,
      game: gameId,
      score,
      timeSpent,
      pointsEarned
    });

    await gameScore.save();

    // Update user points
    await User.findByIdAndUpdate(studentId, {
      $inc: { points: pointsEarned }
    });

    res.json({
      message: "Score submitted successfully",
      pointsEarned,
      totalScore: score
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