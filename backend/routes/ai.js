const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { generateSproutyResponse, generateEcoPlan, generateGameQuestions } = require("../services/aiService");

// POST /api/ai/sprouty
router.post("/sprouty", protect, async (req, res) => {
  try {
    const { intent, userContext } = req.body;
    
    const allowedIntents = ["tip", "next", "why"];
    const verifiedIntent = allowedIntents.includes(intent) ? intent : "tip";
    
    const reply = await generateSproutyResponse(verifiedIntent, userContext || {});
    
    res.json({ success: true, reply });
  } catch (error) {
    console.error("Sprouty AI Error:", error);
    res.status(500).json({ 
      success: false, 
      reply: "I'm taking a quick nap... let's save the earth later! 🌿" 
    });
  }
});

// POST /api/ai/eco-plan
router.post("/eco-plan", protect, async (req, res) => {
  try {
    const { streak, missionsCompleted, level } = req.body;
    const plan = await generateEcoPlan(streak, missionsCompleted, level);
    res.json({ success: true, plan });
  } catch (error) {
    console.error("Eco Plan AI Error:", error);
    res.status(500).json({ success: false, plan: [] });
  }
});

// POST /api/ai/game-questions
// Returns a batch of multiple-choice questions for quiz-style games.
router.post("/game-questions", protect, async (req, res) => {
  try {
    const { topic = "environment", level = 1, count = 12, exclude = [] } = req.body || {};
    const safeCount = Math.max(6, Math.min(30, parseInt(count, 10) || 12));
    const safeLevel = Math.max(1, Math.min(3, parseInt(level, 10) || 1));
    const safeExclude = Array.isArray(exclude) ? exclude.slice(0, 120).map(String) : [];
    const questions = await generateGameQuestions({
      topic: String(topic || "environment").slice(0, 60),
      level: safeLevel,
      count: safeCount,
      exclude: safeExclude,
    });
    res.json({ success: true, questions: Array.isArray(questions) ? questions : [] });
  } catch (error) {
    console.error("Game Questions AI Error:", error);
    res.status(500).json({ success: false, questions: [] });
  }
});

module.exports = router;
