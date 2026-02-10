const mongoose = require("mongoose");

const quizAttemptSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    quiz: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz", required: true },
    answers: [
      {
        questionIndex: { type: Number, required: true },
        selectedAnswer: { type: Number, required: true },
        isCorrect: { type: Boolean, required: true },
        pointsEarned: { type: Number, default: 0 }
      }
    ],
    totalScore: { type: Number, default: 0 },
    percentage: { type: Number, default: 0 },
    completedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

module.exports = mongoose.model("QuizAttempt", quizAttemptSchema);