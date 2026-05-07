const { MiniGame } = require("../models/MiniGame");

const REQUIRED_GAMES = [
  { name: "Eco Memory Match", type: "memory", category: "biodiversity", difficulty: "easy", pointsReward: 10 },
  { name: "Waste Sorting", type: "sorting", category: "waste-management", difficulty: "medium", pointsReward: 12 },
  { name: "Climate Hero", type: "sorting", category: "climate", difficulty: "medium", pointsReward: 15 },
  { name: "Eco Trivia Race", type: "quiz", category: "climate", difficulty: "hard", pointsReward: 10 },
  { name: "Plant Growth", type: "matching", category: "water", difficulty: "medium", pointsReward: 12 },
  { name: "Eco Habit", type: "quiz", category: "energy", difficulty: "medium", pointsReward: 12 },
  { name: "River Cleanup Rush", type: "sorting", category: "waste-management", difficulty: "medium", pointsReward: 12 },
  { name: "Solar Sprint", type: "sorting", category: "energy", difficulty: "hard", pointsReward: 10 },
  { name: "Eco Quiz Blaster", type: "quiz", category: "climate", difficulty: "easy", pointsReward: 12 },
  { name: "Power Planner", type: "sorting", category: "energy", difficulty: "medium", pointsReward: 12 },
  { name: "Ecosystem Balance", type: "matching", category: "biodiversity", difficulty: "easy", pointsReward: 12 },
  { name: "Carbon Choices", type: "quiz", category: "climate", difficulty: "medium", pointsReward: 12 },
  { name: "Water Cycle Lab", type: "matching", category: "water", difficulty: "medium", pointsReward: 12 },
];

async function ensureMiniGamesSeeded() {
  for (const game of REQUIRED_GAMES) {
    await MiniGame.updateOne(
      { name: game.name },
      { $setOnInsert: { ...game, isActive: true } },
      { upsert: true }
    );
  }
}

module.exports = { ensureMiniGamesSeeded };
