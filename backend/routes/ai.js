const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { generateSproutyResponse, generateEcoPlan } = require("../services/aiService");

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

module.exports = router;
