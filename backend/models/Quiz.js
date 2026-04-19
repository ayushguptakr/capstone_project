const mongoose = require("mongoose");

const quizSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, unique: true, sparse: true },
    description: { type: String },
    questions: [
      {
        question: { type: String, required: true },
        options: [{ type: String, required: true }],
        correctAnswer: { type: Number, required: true }, // index of correct option
        points: { type: Number, default: 5 }
      }
    ],
    totalPoints: { type: Number, default: 0 },
    difficulty: { 
      type: String, 
      enum: ["easy", "medium", "hard"], 
      default: "easy" 
    },
    category: { 
      type: String, 
      enum: ["waste-management", "energy", "water", "biodiversity", "climate"], 
      default: "waste-management" 
    },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Quiz", quizSchema);