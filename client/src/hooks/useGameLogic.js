import { useState, useCallback, useEffect, useRef } from "react";

// ── Question Bank ──────────────────────────────────────────────────
const QUESTIONS = [
  {
    scenario: "You're leaving a room for 15 minutes.",
    choices: [
      { text: "Turn off the lights", correct: true },
      { text: "Leave them on", correct: false },
      { text: "Open all windows", correct: false },
      { text: "Turn on more lights", correct: false },
    ],
    explanation: "Turning off lights when leaving saves ~0.1 kWh per hour.",
    impact: { type: "energy", value: "0.1 kWh saved" }
  },
  {
    scenario: "You're brushing your teeth in the morning.",
    choices: [
      { text: "Turn off tap while brushing", correct: true },
      { text: "Keep the water running", correct: false },
      { text: "Use a cup of hot water", correct: false },
      { text: "Brush without water", correct: false },
    ],
    explanation: "Turning off the tap saves up to 8 liters of water per brush!",
    impact: { type: "water", value: "8L water saved" }
  },
  {
    scenario: "You finished a plastic water bottle.",
    choices: [
      { text: "Rinse and recycle it", correct: true },
      { text: "Throw it in general waste", correct: false },
      { text: "Leave it on the table", correct: false },
      { text: "Crush and toss anywhere", correct: false },
    ],
    explanation: "Recycling one plastic bottle saves enough energy to power a lightbulb for 3 hours.",
    impact: { type: "waste", value: "1 bottle recycled" }
  },
  {
    scenario: "It's a warm day and you want to cool your room.",
    choices: [
      { text: "Open windows for natural breeze", correct: true },
      { text: "Blast the AC at 16°C", correct: false },
      { text: "Turn on AC and open windows", correct: false },
      { text: "Buy a second AC unit", correct: false },
    ],
    explanation: "Natural ventilation uses zero electricity and reduces carbon emissions.",
    impact: { type: "co2", value: "2 kg CO₂ avoided" }
  },
  {
    scenario: "You have leftover food from lunch.",
    choices: [
      { text: "Store it for dinner", correct: true },
      { text: "Throw it in the trash", correct: false },
      { text: "Leave it on the counter", correct: false },
      { text: "Flush it down the sink", correct: false },
    ],
    explanation: "Food waste in landfills produces methane — 80x worse than CO₂.",
    impact: { type: "waste", value: "0.5 kg food saved" }
  },
  {
    scenario: "You need to go to a shop 500 meters away.",
    choices: [
      { text: "Walk or cycle there", correct: true },
      { text: "Drive your car", correct: false },
      { text: "Order an Uber", correct: false },
      { text: "Ask someone to drive you", correct: false },
    ],
    explanation: "Walking 500m saves ~0.2 kg CO₂ compared to driving.",
    impact: { type: "co2", value: "0.2 kg CO₂ saved" }
  },
  {
    scenario: "You're shopping and need a bag for groceries.",
    choices: [
      { text: "Use your reusable bag", correct: true },
      { text: "Take a plastic bag", correct: false },
      { text: "Double-bag with plastic", correct: false },
      { text: "Ask for paper bags", correct: false },
    ],
    explanation: "One reusable bag replaces ~700 plastic bags in its lifetime.",
    impact: { type: "waste", value: "1 plastic bag avoided" }
  },
  {
    scenario: "Your phone is fully charged but still plugged in.",
    choices: [
      { text: "Unplug the charger", correct: true },
      { text: "Leave it plugged in", correct: false },
      { text: "Plug in another device too", correct: false },
      { text: "It doesn't matter", correct: false },
    ],
    explanation: "Phantom power from plugged-in chargers wastes 5-10% of home energy.",
    impact: { type: "energy", value: "0.05 kWh saved" }
  },
  {
    scenario: "You're about to take a shower.",
    choices: [
      { text: "Keep it under 5 minutes", correct: true },
      { text: "Take a 20-minute hot shower", correct: false },
      { text: "Fill the bathtub instead", correct: false },
      { text: "Shower with the window open", correct: false },
    ],
    explanation: "A 5-min shower uses ~40L vs 150L for a bath. Huge savings!",
    impact: { type: "water", value: "110L water saved" }
  },
  {
    scenario: "You're printing a document for class.",
    choices: [
      { text: "Print double-sided", correct: true },
      { text: "Print single-sided", correct: false },
      { text: "Print multiple copies", correct: false },
      { text: "Use colored ink", correct: false },
    ],
    explanation: "Double-sided printing cuts paper usage by 50% — saving trees!",
    impact: { type: "trees", value: "0.01 trees saved" }
  },
  {
    scenario: "You notice a dripping tap in the bathroom.",
    choices: [
      { text: "Fix it or report it immediately", correct: true },
      { text: "Ignore it, it's just drops", correct: false },
      { text: "Put a bucket and forget", correct: false },
      { text: "Open it more to stop dripping", correct: false },
    ],
    explanation: "A dripping tap wastes up to 20,000 liters of water per year!",
    impact: { type: "water", value: "55L/day saved" }
  },
  {
    scenario: "You're choosing between products at the store.",
    choices: [
      { text: "Pick the one with less packaging", correct: true },
      { text: "Pick the cheapest option", correct: false },
      { text: "Pick the most colorful box", correct: false },
      { text: "Buy both to compare", correct: false },
    ],
    explanation: "Packaging accounts for 30% of municipal waste. Less is better!",
    impact: { type: "waste", value: "Packaging reduced" }
  },
  {
    scenario: "You're doing laundry this evening.",
    choices: [
      { text: "Wait for a full load", correct: true },
      { text: "Wash a half-empty machine", correct: false },
      { text: "Run two small loads", correct: false },
      { text: "Use hot water for colors", correct: false },
    ],
    explanation: "Full loads save 3,400 gallons of water per year on average.",
    impact: { type: "water", value: "50L water saved" }
  },
  {
    scenario: "You're writing notes for studying.",
    choices: [
      { text: "Use a digital device or reuse paper", correct: true },
      { text: "Use fresh paper every time", correct: false },
      { text: "Write large to fill pages", correct: false },
      { text: "Buy new notebooks weekly", correct: false },
    ],
    explanation: "Going digital or reusing paper saves ~24 trees per ton of paper!",
    impact: { type: "trees", value: "Paper saved" }
  },
  {
    scenario: "Your old clothes don't fit anymore.",
    choices: [
      { text: "Donate or upcycle them", correct: true },
      { text: "Throw them in the trash", correct: false },
      { text: "Burn them in the yard", correct: false },
      { text: "Leave them in the closet forever", correct: false },
    ],
    explanation: "Textile recycling prevents 2.6 million tons from reaching landfills yearly.",
    impact: { type: "waste", value: "Textile waste prevented" }
  },
];

// Dynamics will be configured in the hook


function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * useGameLogic — Core game state machine.
 * Returns everything the UI needs to render the game.
 */
export default function useGameLogic(level = 1) {
  const ROUNDS = level === 1 ? 5 : level === 2 ? 10 : 15;
  const TIME_PER_QUESTION = level === 1 ? 10 : level === 2 ? 7 : 5;
  
  const [phase, setPhase] = useState("ready"); // ready | playing | feedback | ended
  const [questions, setQuestions] = useState([]);// eslint-disable-next-line react-hooks/exhaustive-deps
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [timeLeft, setTimeLeft] = useState(TIME_PER_QUESTION);
  const [score, setScore] = useState(0);
  const [streakCount, setStreakCount] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [results, setResults] = useState([]);// eslint-disable-next-line react-hooks/exhaustive-deps
  const timerRef = useRef(null);

  // Multiplier: 1x base, +0.5x per streak hit (max 3x)
  const multiplier = Math.min(3, 1 + streakCount * 0.5);

  const currentQuestion = questions[currentIndex] || null;
  const progress = questions.length > 0 ? ((currentIndex) / ROUNDS) * 100 : 0;

  // ── Start Game ─────────────────────────────
  const startGame = useCallback(() => {
    const picked = shuffle(QUESTIONS).slice(0, ROUNDS);
    // Shuffle choices within each question
    const withShuffled = picked.map(q => ({
      ...q,
      choices: shuffle(q.choices)
    }));
    setQuestions(withShuffled);
    setCurrentIndex(0);
    setScore(0);
    setStreakCount(0);
    setMaxStreak(0);
    setCorrectCount(0);
    setResults([]);// eslint-disable-next-line react-hooks/exhaustive-deps
    setSelectedIdx(null);
    setIsCorrect(null);
    setTimeLeft(TIME_PER_QUESTION);
    setPhase("playing");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Timer ──────────────────────────────────
  useEffect(() => {
    if (phase !== "playing") return;
    if (timeLeft <= 0) {
      // Time's up — auto-wrong
      handleAnswer(-1);
      return;
    }
    timerRef.current = setTimeout(() => {
      setTimeLeft(t => t - 1);
    }, 1000);
    return () => clearTimeout(timerRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, timeLeft]);

  // ── Answer Handler ─────────────────────────
  const handleAnswer = useCallback((choiceIndex) => {
    if (phase !== "playing" || selectedIdx !== null) return;
    clearTimeout(timerRef.current);

    const q = questions[currentIndex];
    if (!q) return;

    const correct = choiceIndex >= 0 && q.choices[choiceIndex]?.correct === true;
    const timeBonus = Math.round(timeLeft * 10); // up to 70 bonus
    const basePoints = correct ? 100 : 0;
    const roundScore = correct ? Math.round((basePoints + timeBonus) * multiplier) : 0;

    setSelectedIdx(choiceIndex);
    setIsCorrect(correct);
    setPhase("feedback");

    if (correct) {
      setScore(s => s + roundScore);
      setCorrectCount(c => c + 1);
      setStreakCount(s => {
        const next = s + 1;
        setMaxStreak(m => Math.max(m, next));
        return next;
      });
    } else {
      setStreakCount(0);
    }

    setResults(r => [...r, {
      scenario: q.scenario,
      correct,
      points: roundScore,
      timeLeft,
      impact: q.impact
    }]);
  }, [phase, selectedIdx, questions, currentIndex, timeLeft, multiplier]);

  // ── Next Question ──────────────────────────
  const nextQuestion = useCallback(() => {
    if (currentIndex >= ROUNDS - 1) {
      setPhase("ended");
      return;
    }
    setCurrentIndex(i => i + 1);
    setSelectedIdx(null);
    setIsCorrect(null);
    setTimeLeft(TIME_PER_QUESTION);
    setPhase("playing");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex]);

  // ── Computed Stats ─────────────────────────
  const accuracy = ROUNDS > 0 ? Math.round((correctCount / ROUNDS) * 100) : 0;
  const xpEarned = Math.round(score * 0.4); // Convert score → XP
  const ecoImpacts = results.filter(r => r.correct).map(r => r.impact);

  return {
    phase,
    currentQuestion,
    currentIndex,
    selectedIdx,
    isCorrect,
    timeLeft,
    maxTime: TIME_PER_QUESTION,
    score,
    streakCount,
    maxStreak,
    multiplier,
    correctCount,
    accuracy,
    progress,
    xpEarned,
    ecoImpacts,
    totalRounds: ROUNDS,
    startGame,
    handleAnswer,
    nextQuestion,
  };
}
