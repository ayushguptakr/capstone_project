const Quiz = require("../models/Quiz");
const QuizAttempt = require("../models/QuizAttempt");
const User = require("../models/User");
const adaptiveDifficultyEngine = require("../services/adaptiveDifficultyEngine");
const gamificationService = require("../services/gamificationService");

// Get all active quizzes
const getQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find({ isActive: true })
      .select("-questions.correctAnswer")
      .populate("createdBy", "name");
    res.json(quizzes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get quiz by ID (for taking quiz)
const getQuizById = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id)
      .select("-questions.correctAnswer");
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }
    res.json(quiz);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Submit quiz attempt
const submitQuiz = async (req, res) => {
  try {
    const { quizId, answers, timeTakenPerQuestion } = req.body;
    const studentId = req.user.id;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    let totalScore = 0;
    const processedAnswers = answers.map((answer, index) => {
      const question = quiz.questions[index];
      const isCorrect = answer.selectedAnswer === question.correctAnswer;
      const pointsEarned = isCorrect ? question.points : 0;
      totalScore += pointsEarned;

      return {
        questionIndex: index,
        selectedAnswer: answer.selectedAnswer,
        isCorrect,
        pointsEarned
      };
    });

    const percentage = (totalScore / quiz.totalPoints) * 100;

    const quizAttempt = new QuizAttempt({
      student: studentId,
      quiz: quizId,
      category: quiz.category,
      difficulty: quiz.difficulty,
      answers: processedAnswers,
      timeTakenPerQuestion: Array.isArray(timeTakenPerQuestion) ? timeTakenPerQuestion : [],
      totalScore,
      percentage
    });

    await quizAttempt.save();

    // Award XP/points through central gamification service.
    await gamificationService.awardPoints({
      userId: studentId,
      points: totalScore,
      source: "quiz",
      sourceRef: String(quizId),
      idempotencyKey: `quiz-attempt:${quizAttempt._id}`,
      metadata: { percentage },
    });

    // Check for badges
    await checkAndAwardBadges(studentId, totalScore, percentage);

    // Update adaptive learning profile (non-blocking for user success)
    let adjustments = null;
    try {
      await adaptiveDifficultyEngine.updateFromQuizAttempt(
        studentId,
        quiz,
        processedAnswers,
        Array.isArray(timeTakenPerQuestion) ? timeTakenPerQuestion : []
      );
      adjustments = await adaptiveDifficultyEngine.computeAdjustments(studentId, quiz.category);
    } catch (e) {
      // ignore adaptive failures
    }

    res.json({
      message: "Quiz submitted successfully",
      score: totalScore,
      percentage,
      totalPossible: quiz.totalPoints,
      adaptive: adjustments
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create quiz (teacher/admin only)
const createQuiz = async (req, res) => {
  try {
    const { title, description, questions, difficulty, category } = req.body;
    
    const totalPoints = questions.reduce((sum, q) => sum + (q.points || 5), 0);

    const quiz = new Quiz({
      title,
      description,
      questions,
      totalPoints,
      difficulty,
      category,
      createdBy: req.user.id
    });

    await quiz.save();
    res.status(201).json({ message: "Quiz created successfully", quiz });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get student's quiz attempts
const getStudentAttempts = async (req, res) => {
  try {
    const attempts = await QuizAttempt.find({ student: req.user.id })
      .populate("quiz", "title category difficulty")
      .sort({ createdAt: -1 });
    res.json(attempts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Helper function to check and award badges
const checkAndAwardBadges = async (studentId, score, percentage) => {
  const user = await User.findById(studentId);
  const newBadges = [];

  // Quiz Master badge - 100% on any quiz
  if (percentage === 100 && !user.badges.some(b => b.title === "Quiz Master")) {
    newBadges.push({
      title: "Quiz Master",
      icon: "🏆",
      earnedAt: new Date()
    });
  }

  // Eco Scholar badge - 500+ total points
  if (user.points >= 500 && !user.badges.some(b => b.title === "Eco Scholar")) {
    newBadges.push({
      title: "Eco Scholar",
      icon: "🌟",
      earnedAt: new Date()
    });
  }

  if (newBadges.length > 0) {
    await User.findByIdAndUpdate(studentId, {
      $push: { badges: { $each: newBadges } }
    });
  }
};

module.exports = {
  getQuizzes,
  getQuizById,
  submitQuiz,
  createQuiz,
  getStudentAttempts
};