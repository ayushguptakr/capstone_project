const Quiz = require("../models/Quiz");
const QuizAttempt = require("../models/QuizAttempt");
const User = require("../models/User");
const adaptiveDifficultyEngine = require("../services/adaptiveDifficultyEngine");
const gamificationService = require("../services/gamificationService");
const { buildContentScope } = require("../middleware/scopeFilter");

const QUIZ_CURRICULUM = {
  version: 1,
  order: ["waste-1", "energy-1", "water-1", "climate-1", "biodiversity-1"]
};

// In-memory idempotency cache for attempts 
const processedAttempts = new Set();

function calculateStars(correct, total) {
  if (total === 0) return 0;
  const accuracy = correct / total;
  if (total > 10 && accuracy >= (total - 1) / total) return 3; // 1 mistake allowed
  if (accuracy === 1) return 3;
  if (accuracy >= 0.8) return 2;
  if (accuracy >= 0.6) return 1;
  return 0;
}

// Get all active quizzes (scoped to school + global)
const getQuizzes = async (req, res) => {
  try {
    const scope = buildContentScope(req.user, { skipClassFilter: true });
    const quizzes = await Quiz.find({ ...scope, isActive: true })
      .select("-questions.correctAnswer")
      .populate("createdBy", "name");
    res.json(quizzes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getQuizById = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id).select("-questions.correctAnswer");
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    // Enforce Backend Route Locking via Curriculum
    const slug = quiz.slug || String(quiz._id);
    const idx = QUIZ_CURRICULUM.order.indexOf(slug);
    
    if (idx > 0) {
      const prevSlug = QUIZ_CURRICULUM.order[idx - 1];
      const user = await User.findById(req.user.id);
      
      const prevProgress = user.quizProgress?.get(prevSlug);
      if (!prevProgress || prevProgress.stars < 1) {
        return res.status(403).json({ message: "This quiz is locked. Complete the previous quiz to unlock it." });
      }
    }

    res.json(quiz);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Submit quiz attempt
const submitQuiz = async (req, res) => {
  try {
    const { quizId, attemptId, answers, timeTakenPerQuestion } = req.body;
    const studentId = req.user.id;

    if (attemptId) {
      if (processedAttempts.has(attemptId)) {
        return res.status(200).json({ message: "Attempt already processed", duplicate: true });
      }
      processedAttempts.add(attemptId);
      // clean up old keys periodically if needed, omitted for brevity
    }

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    let totalScore = 0;
    let correctCount = 0;
    const processedAnswers = answers.map((answer, index) => {
      const question = quiz.questions[index];
      const isCorrect = answer.selectedAnswer === question.correctAnswer;
      const pointsEarned = isCorrect ? question.points : 0;
      totalScore += pointsEarned;
      if (isCorrect) correctCount++;

      return {
        questionIndex: index,
        selectedAnswer: answer.selectedAnswer,
        isCorrect,
        pointsEarned
      };
    });

    const percentage = (totalScore / quiz.totalPoints) * 100;
    const starsEarned = calculateStars(correctCount, quiz.questions.length);

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

    const user = await User.findById(studentId);
    const slug = quiz.slug || String(quizId);
    if (!user.quizProgress) {
      user.quizProgress = new Map();
    }
    
    let currentProgress = user.quizProgress.get(slug) || { bestScore: 0, lastScore: 0, stars: 0, attempts: 0, lastPlayedAt: null };
    
    // Calculate new bests
    const isNewBest = totalScore > currentProgress.bestScore;
    const actualNewBestDelta = isNewBest ? totalScore - currentProgress.bestScore : 0;
    
    currentProgress.bestScore = isNewBest ? totalScore : currentProgress.bestScore;
    currentProgress.lastScore = totalScore;
    currentProgress.stars = Math.max(currentProgress.stars, starsEarned);
    currentProgress.attempts += 1;
    
    const now = new Date();
    currentProgress.lastPlayedAt = now;
    
    user.quizProgress.set(slug, currentProgress);

    // Global streak logic update (if not played today)
    // We update global if lastActivityAt is older than start of today
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    if (!user.lastActivityAt || user.lastActivityAt < startOfToday) {
      user.streakCurrent = (user.streakCurrent || 0) + 1;
    }
    user.lastActivityAt = now;
    
    await user.save();

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
      adaptive: adjustments,
      mastery: {
        starsEarned,
        newBest: actualNewBestDelta
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create quiz (teacher/admin only) — stamps schoolId from creator
const createQuiz = async (req, res) => {
  try {
    const { title, description, questions, difficulty, category, targetClass } = req.body;
    
    const totalPoints = questions.reduce((sum, q) => sum + (q.points || 5), 0);

    const quiz = new Quiz({
      title,
      description,
      questions,
      totalPoints,
      difficulty,
      category,
      targetClass: targetClass || null,
      schoolId: req.user.schoolId || null,
      isGlobal: !req.user.schoolId, // admin-created quizzes without school are global
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
  if (percentage === 100 && !user.badges.includes("Quiz Master")) {
    newBadges.push("Quiz Master");
  }

  // Eco Scholar badge - 500+ total points
  if (user.points >= 500 && !user.badges.includes("Eco Scholar")) {
    newBadges.push("Eco Scholar");
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