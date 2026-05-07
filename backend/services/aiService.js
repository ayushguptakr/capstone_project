const { GoogleGenerativeAI } = require("@google/generative-ai");

/**
 * Ensures the promise resolves or rejects within ms milliseconds.
 */
function withTimeout(promise, ms, fallback) {
  let timer;
  const timeoutPromise = new Promise((resolve) => {
    timer = setTimeout(() => {
      resolve(fallback);
    }, ms);
  });

  return Promise.race([
    promise.then((res) => {
      clearTimeout(timer);
      return res;
    }).catch(() => {
      clearTimeout(timer);
      return fallback;
    }),
    timeoutPromise
  ]);
}

/**
 * Helper to execute generative AI text calls globally ensuring JSON parse testing optionally.
 */
async function callGenerativeModelText(promptText, isJson = false) {
  const provider = process.env.AI_PROVIDER || "gemini";
  if (provider === "gemini") {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY is not defined in environment.");
    
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); 
    
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: promptText }] }],
      generationConfig: {
        maxOutputTokens: 200,
        temperature: 0.3,
        responseMimeType: isJson ? "application/json" : "text/plain"
      }
    });

    const responseText = result.response.text().trim();
    return responseText;
  }
  
  throw new Error(`Provider ${provider} is not currently supported in mapping.`);
}

/**
 * Generates an insight explicitly for Teacher Dashboards.
 */
async function generateTeacherInsight(analyticsData) {
  const fallback = `Engagement drops noted in ${analyticsData.weakTopic || "key subjects"}. Strongly recommend assigning a localized mission this week.`;

  const promptText = `
You are an expert educational AI copilot for an eco-learning platform.
Analyze this snapshot of teacher metrics:
${JSON.stringify(analyticsData, null, 2)}

Return exactly two sentences: 
(1) What is weak or needs attention.
(2) What exact actionable task or quiz the teacher should assign right now.
No extra text, no markdown, no greetings.
  `.trim();

  const task = async () => callGenerativeModelText(promptText, false);
  return await withTimeout(task(), 4000, fallback);
}

/**
 * Generates a mission definition ensuring a strict, sanitized JSON payload logic. 
 */
async function generateMission(topic, difficulty) {
  const fallbackJson = {
    title: `Local ${topic} Initiative`,
    description: `A standard hands-on community task to understand ${topic}. Complete the activity and upload a photo!`,
    difficulty: "medium"
  };

  const promptText = `
You are an AI generating an ecological mission for students.
Create a ${difficulty} difficulty mission regarding the topic: "${topic}".
Return ONLY valid JSON matching this exact structure precisely:
{
  "title": "A short engaging title (max 60 chars)",
  "description": "Clear instructions (max 200 chars)",
  "difficulty": "easy" | "medium" | "hard"
}
Output nothing else, no markdown fences.
`.trim();

  const task = async () => {
    const raw = await callGenerativeModelText(promptText, true);
    // Sanitize any markdown if the LLM hallucinated wrapper strings
    const jsonStr = raw.replace(/^```json/i, "").replace(/```$/i, "").trim();
    const parsed = JSON.parse(jsonStr);
    
    if (!parsed.title || !parsed.description || !parsed.difficulty) throw new Error("Malformed AI response");
    
    // Normalize difficulty securely
    const diffMap = ["easy", "medium", "hard"];
    if (!diffMap.includes(parsed.difficulty.toLowerCase())) parsed.difficulty = "medium";
    
    return parsed;
  };

  try {
    return await withTimeout(task(), 6000, fallbackJson);
  } catch (err) {
    return fallbackJson;
  }
}

/**
 * Generates a student nudge mixing XP calculation with a motivational prompt.
 */
async function generateStudentNudge(pointsToNextLevel, streak) {
  const fallback = pointsToNextLevel < 30 
    ? `You're close to leveling up! Earn ${pointsToNextLevel} more XP.`
    : `Keep your ${streak} day streak alive by finishing a mission today!`;

  const promptText = `
You are an encouraging AI mascot. Return exactly ONE short sentence. 
The student is ${pointsToNextLevel} points away from the next tier and has a streak of ${streak} days.
Make it sound energetic and fun, explicitly mentioning the points or streak. No emojis.
  `.trim();

  const task = async () => callGenerativeModelText(promptText, false);
  return await withTimeout(task(), 3000, fallback);
}

/**
 * Generates a macro-scale insight for Principal dashboards.
 */
async function generatePrincipalInsight(metrics) {
  const fallback = `Class ${metrics.weakClass || "averages"} dropped slightly in engagement this week. Plan a short global competition to boost participation.`;

  const promptText = `
You are an AI advisor to a school principal focusing on sustainability education.
Analyze this macro data: ${JSON.stringify(metrics, null, 2)}
Return exactly two sentences:
(1) State a specific metric (number/direction).
(2) Suggest a broad corrective action (e.g. rally, competition, training).
No extra text or greetings.
  `.trim();

  const task = async () => callGenerativeModelText(promptText, false);
  return await withTimeout(task(), 5000, fallback);
}

/**
 * Generates a full quiz payload embedding the "Repair-over-Reject" heuristic.
 */
async function generateQuiz(topic, classContext = "standard") {
  const fallbackQuiz = {
    title: `${topic} Assessment`,
    description: `A quick knowledge check regarding ${topic}.`,
    difficulty: "medium",
    questions: [
      { question: `What is a key concept in ${topic}?`, options: ["Option A", "Option B", "Option C", "Option D"], answerIndex: 0 }
    ]
  };

  const promptText = `
You are an expert curriculum AI. Create a multi-question quiz about "${topic}".
Class context: ${classContext}.
Generate exactly 3 to 5 questions.
Return ONLY valid JSON matching this exact structure precisely:
{
  "title": "A short engaging title",
  "description": "Clear instructions",
  "difficulty": "easy" | "medium" | "hard",
  "questions": [
    {
      "question": "A sufficiently complex question",
      "options": ["A", "B", "C", "D"],
      "answerIndex": 1
    }
  ]
}
Output nothing else, no markdown fences.
`.trim();

  const task = async () => {
    try {
      const raw = await callGenerativeModelText(promptText, true);
      const jsonStr = raw.replace(/^```json/i, "").replace(/```$/i, "").trim();
      const parsed = JSON.parse(jsonStr);

      if (!parsed.title) parsed.title = fallbackQuiz.title;
      if (!parsed.description) parsed.description = fallbackQuiz.description;
      if (!["easy", "medium", "hard"].includes((parsed.difficulty || "").toLowerCase())) parsed.difficulty = "medium";

      // Repair-over-Reject questions
      let validQuestions = [];
      if (Array.isArray(parsed.questions)) {
        for (const q of parsed.questions) {
          // Semantic Guard: Avoid trivialities
          if (!q.question || q.question.length < 15) {
            console.warn(`[AI Repair] Dropped trivial question: ${q.question}`);
            continue; 
          }
          
          let opts = Array.isArray(q.options) ? q.options.map(o => String(o)) : ["A", "B", "C", "D"];
          
          // Semantic Guard: Prevent duplicates
          opts = [...new Set(opts)]; 
          
          // Structure Guard: Pad/Trim to exactly 4
          while(opts.length < 4) opts.push(`Alternative ${opts.length + 1}`);
          if (opts.length > 4) opts = opts.slice(0, 4);

          let aIdx = Number(q.answerIndex);
          if (isNaN(aIdx) || aIdx < 0 || aIdx > 3) aIdx = 0;

          validQuestions.push({ question: q.question, options: opts, answerIndex: aIdx });
        }
      }

      // If utterly destroyed beyond repair, fallback
      if (validQuestions.length === 0) return fallbackQuiz;
      
      parsed.questions = validQuestions;
      return parsed;

    } catch (err) {
      console.warn("[AI Repair] Major validation failure, invoking fallback.", err.message);
      return fallbackQuiz;
    }
  };

  return await withTimeout(task(), 8000, fallbackQuiz); // Allow a bit more time for heavy quiz gen
}

/**
 * Drafts contextual submission feedback retaining school-safe voice natively bounded.
 */
async function draftSubmissionFeedback(payload) {
  // Extract strictly to prevent undefined mapping
  const { taskTitle = "Task", taskDescription = "", studentText = "N/A", submissionType = "text" } = payload;
  const fallback = "Excellent effort completing this mission! Keep up the great work.";

  const promptText = `
You are an encouraging, professional teacher grading eco-missions.
Write exactly ONE or TWO concise sentences of feedback for the student.

Task: "${taskTitle}" (${taskDescription.substring(0, 100)}...)
Submission Type: ${submissionType}
Student Text Provided: "${studentText}"

RULES:
- Maintain a "school-safe" tone. Be encouraging, constructive, or neutral. Do NOT use overly casual slang.
- Vary your wording heavily. Do not start with generic "Great job!".
- If the submission is heavily image-based ("${submissionType}" is image), praise their visual proof BUT explicitly suggest one specific visual or contextual improvement for next time (e.g. angle, lighting, framing).
- Do not grade them explicitly.

Output only the plain text feedback.
`.trim();

  const task = async () => callGenerativeModelText(promptText, false);
  return await withTimeout(task(), 5000, fallback);
}

/**
 * Serves quick responses for the Sprouty Mascot.
 */
async function generateSproutyResponse(intent, userContext = {}) {
  let fallback = "You're doing great—try completing one mission today 🌿";
  if (intent === "tip") fallback = "Try turning off appliances when not in use to save energy!";
  if (intent === "next") fallback = "Check your Eco Plan and knock out a quick mission!";
  if (intent === "why") fallback = "Every small action reduces our carbon footprint and protects local ecosystems.";

  const promptText = `
You are Sprouty, an eco companion.
Respond in max 2 sentences.
Tone: friendly, motivating, simple.
Intent: ${intent}
User context: ${JSON.stringify(userContext)}

Rules:
- tip → give actionable suggestion
- next → guide next task
- why → explain impact
- NEVER repeat same structure
`.trim();

  const task = async () => callGenerativeModelText(promptText, false);
  return await withTimeout(task(), 4000, fallback);
}

/**
 * Generates an Eco Plan array strictly returning 3 typed action objects.
 */
async function generateEcoPlan(streak = 0, missionsCompleted = 0, level = 1) {
  const fallback = [
    { task: "Turn off lights leaving a room", impact: "+10 XP", type: "energy", verificationType: "quick" },
    { task: "Sort recycling and trash properly", impact: "+15 XP", type: "waste", verificationType: "proof" },
    { task: "Reduce shower time by 2 minutes", impact: "+20 XP", type: "water", verificationType: "quiz" }
  ];

  const promptText = `
You are an eco-coach for students.
Create a simple daily eco plan based on:
- User streak: ${streak} days
- Completed missions: ${missionsCompleted}
- Level: ${level}

Rules:
- Generate EXACTLY 3 actionable tasks.
- Keep language simple.
- Output ONLY valid JSON matching this exact structure:
[
  {
    "task": "A short, actionable environmental tip",
    "impact": "+XX XP",
    "type": "water" | "waste" | "energy" | "habit",
    "verificationType": "quick" | "proof" | "quiz"
  }
]
Output nothing else, no markdown fences.
`.trim();

  const task = async () => {
    const raw = await callGenerativeModelText(promptText, true);
    const jsonStr = raw.replace(/^```json/i, "").replace(/```$/i, "").trim();
    const parsed = JSON.parse(jsonStr);
    
    if (!Array.isArray(parsed) || parsed.length === 0) throw new Error("Invalid eco-plan structure");
    
    return parsed.map(t => {
      const validTypes = ["quick", "proof", "quiz"];
      const vType = t.verificationType && validTypes.includes(t.verificationType.toLowerCase()) ? t.verificationType.toLowerCase() : "quick";
      return {
        task: t.task || "Complete a daily green challenge",
        impact: t.impact || "+10 XP",
        type: (t.type || "habit").toLowerCase(),
        verificationType: vType
      };
    }).slice(0, 3);
  };

  try {
    return await withTimeout(task(), 6000, fallback);
  } catch (err) {
    return fallback;
  }
}

/**
 * Generate multiple-choice questions for mini-games.
 * Output schema:
 * [{ id, question, options: [..], answerIndex, fact }]
 */
async function generateGameQuestions({ topic = "environment", level = 1, count = 12, exclude = [] }) {
  const safeCount = Math.max(6, Math.min(30, parseInt(count, 10) || 12));
  const safeLevel = Math.max(1, Math.min(3, parseInt(level, 10) || 1));
  const excludeSet = new Set((Array.isArray(exclude) ? exclude : []).map((s) => String(s)));

  // Solid fallback set (no AI dependency)
  const fallback = [
    { id: "w1", question: "Which action saves water the most?", options: ["Longer showers", "Fix leaks", "Wash car daily"], answerIndex: 1, fact: "Small leaks waste lots of water over time." },
    { id: "w2", question: "Best item for compost?", options: ["Banana peel", "Glass bottle", "Plastic wrap"], answerIndex: 0, fact: "Organic waste can become compost instead of landfill methane." },
    { id: "e1", question: "Which is renewable energy?", options: ["Wind", "Coal", "Diesel"], answerIndex: 0, fact: "Wind is naturally replenished and produces no smoke." },
    { id: "c1", question: "Trees help climate mainly by...", options: ["Making noise", "Absorbing CO₂", "Creating plastic"], answerIndex: 1, fact: "Trees absorb CO₂ and store carbon in biomass." },
    { id: "r1", question: "Which is NOT usually recyclable?", options: ["Paper", "Glass", "Styrofoam"], answerIndex: 2, fact: "Styrofoam is hard to recycle in many places." },
    { id: "p1", question: "What reduces 'phantom power'?", options: ["Leave chargers plugged", "Unplug devices", "Open windows"], answerIndex: 1, fact: "Standby devices draw power even when not used." },
  ].filter((q) => !excludeSet.has(q.id));

  const promptText = `
You generate short, accurate environmental quiz questions for students.
Topic: "${String(topic).slice(0, 60)}"
Difficulty level: ${safeLevel} (1 easy, 2 medium, 3 hard)
Need: ${safeCount} unique questions.
Exclude these ids: ${JSON.stringify(Array.from(excludeSet).slice(0, 120))}

Return ONLY valid JSON as an array of objects with EXACT keys:
[
  {
    "id": "short-unique-id",
    "question": "string (15-120 chars)",
    "options": ["A","B","C"],
    "answerIndex": 0,
    "fact": "one-sentence explanation (max 140 chars, no emojis)"
  }
]

Rules:
- Exactly 3 options per question.
- answerIndex must be 0,1,2.
- No emojis.
- Avoid repeated questions.
Output nothing else.
`.trim();

  const task = async () => {
    const raw = await callGenerativeModelText(promptText, true);
    const jsonStr = raw.replace(/^```json/i, "").replace(/```$/i, "").trim();
    const parsed = JSON.parse(jsonStr);
    if (!Array.isArray(parsed) || parsed.length === 0) throw new Error("Invalid questions structure");

    const cleaned = [];
    const seen = new Set();
    for (const q of parsed) {
      const id = String(q?.id || "").trim();
      if (!id || excludeSet.has(id) || seen.has(id)) continue;
      const question = String(q?.question || "").trim();
      const options = Array.isArray(q?.options) ? q.options.map((o) => String(o).trim()).filter(Boolean) : [];
      const answerIndex = Number(q?.answerIndex);
      const fact = String(q?.fact || "").trim();
      if (question.length < 15 || question.length > 140) continue;
      if (options.length !== 3) continue;
      if (![0, 1, 2].includes(answerIndex)) continue;
      if (!fact || fact.length > 160) continue;
      if (/[^\x00-\x7F]/.test(fact)) {
        // still allow unicode letters, but we want to avoid emoji; lightweight filter:
        // keep as-is and rely on prompt; do not hard-fail
      }
      cleaned.push({ id, question, options, answerIndex, fact });
      seen.add(id);
      if (cleaned.length >= safeCount) break;
    }
    return cleaned.length >= 6 ? cleaned : fallback;
  };

  try {
    return await withTimeout(task(), 7000, fallback);
  } catch {
    return fallback;
  }
}

module.exports = {
  generateTeacherInsight,
  generateMission,
  generateStudentNudge,
  generatePrincipalInsight,
  generateQuiz,
  draftSubmissionFeedback,
  generateSproutyResponse,
  generateEcoPlan,
  generateGameQuestions,
};
