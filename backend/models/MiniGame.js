const mongoose = require("mongoose");

const miniGameSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    type: { 
      type: String, 
      enum: ["sorting", "matching", "memory", "quiz"], 
      required: true 
    },
    category: { 
      type: String, 
      enum: ["waste-management", "energy", "water", "biodiversity", "climate"], 
      required: true 
    },
    difficulty: { 
      type: String, 
      enum: ["easy", "medium", "hard"], 
      default: "easy" 
    },
    pointsReward: { type: Number, default: 10 },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

const gameScoreSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    game: { type: mongoose.Schema.Types.ObjectId, ref: "MiniGame", required: true },
    score: { type: Number, required: true },
    timeSpent: { type: Number }, // in seconds
    pointsEarned: { type: Number, default: 0 }
  },
  { timestamps: true }
);

const MiniGame = mongoose.model("MiniGame", miniGameSchema);
const GameScore = mongoose.model("GameScore", gameScoreSchema);

module.exports = { MiniGame, GameScore };