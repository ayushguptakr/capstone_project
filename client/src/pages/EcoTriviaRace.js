import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "./EcoTriviaRace.css";
import useFeedback from "../hooks/useFeedback";
import useSound from "../hooks/useSound";
import GameRewardModal from "../components/GameRewardModal";
import gamesConfig from "../data/gamesConfig";
import useMiniGameRun from "../hooks/useMiniGameRun";
import MiniGameDebugPanel from "../components/game/MiniGameDebugPanel";
import useGameQuestionPool from "../hooks/useGameQuestionPool";

const questions = [
  { q: "Which gas do trees absorb?", a: ["CO2", "O2", "N2", "H2"], c: 0 },
  { q: "What percentage of Earth is water?", a: ["50%", "60%", "71%", "80%"], c: 2 },
  { q: "Which is renewable energy?", a: ["Coal", "Solar", "Oil", "Gas"], c: 1 },
  { q: "How long does plastic take to decompose?", a: ["10 years", "50 years", "100 years", "450+ years"], c: 3 },
  { q: "What is the main greenhouse gas?", a: ["CO2", "Methane", "Oxygen", "Nitrogen"], c: 0 },
  { q: "Which animal is endangered?", a: ["Cat", "Dog", "Panda", "Rat"], c: 2 },
  { q: "What causes acid rain?", a: ["Water", "Pollution", "Sunlight", "Wind"], c: 1 },
  { q: "Which is NOT recyclable?", a: ["Paper", "Glass", "Styrofoam", "Metal"], c: 2 },
  { q: "What is composting?", a: ["Burning waste", "Recycling plastic", "Decomposing organic waste", "Throwing trash"], c: 2 },
  { q: "Which uses most water?", a: ["Shower", "Toilet", "Agriculture", "Washing car"], c: 2 }
];

function EcoTriviaRace() {
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  
  const searchParams = new URLSearchParams(window.location.search);
  const level = parseInt(searchParams.get("level")) || 1;
  const initialTime = level === 1 ? 10 : level === 2 ? 7 : 4;

  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [gameOver, setGameOver] = useState(false);
  const [streak, setStreak] = useState(0);
  const navigate = useNavigate();
  const { triggerXPFromEvent, triggerSuccess } = useFeedback();
  const { playClick } = useSound();
  const gameConfig = gamesConfig.find(g => g.id === "trivia-race");
  const { run, submitting, submitResult, submitScore } = useMiniGameRun({ gameId: "eco-trivia-race", level });

  const fallbackPool = useMemo(
    () =>
      questions.map((x, idx) => ({
        id: `trivia-fb-${idx}`,
        question: x.q,
        options: x.a,
        answerIndex: x.c,
        fact: "",
      })),
    []
  );
  const { nextQuestion: getNextQuestion } = useGameQuestionPool({
    topic: "environment basics",
    level,
    desiredCount: 18,
    fallback: fallbackPool,
  });
  const [active, setActive] = useState(() => getNextQuestion() || fallbackPool[0]);

  useEffect(() => {
    if (timeLeft <= 0) {
      advanceQuestion();
      return;
    }
    const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft]);

  const handleAnswer = (index, event) => {
    playClick();
    if (index === active?.answerIndex) {
      const points = 10 + (timeLeft * 2) + (streak * 5);
      setScore(score + points);
      setStreak(streak + 1);
      triggerXPFromEvent(points, event, { y: window.innerHeight * 0.45 });
    } else {
      setStreak(0);
    }
    advanceQuestion();
  };

  const advanceQuestion = () => {
    if (currentQ >= 9) {
      endGame();
    } else {
      setCurrentQ(currentQ + 1);
      setTimeLeft(initialTime);
      const q = getNextQuestion() || active || fallbackPool[0];
      setActive(q);
    }
  };

  const endGame = async () => {
    setGameOver(true);
    triggerSuccess();
    await submitScore({
      score,
      timeSpent: (questions.length * initialTime) - timeLeft,
    });
  };

  if (gameOver) {
    return (
      <div className="trivia-race-container">
        <GameRewardModal
          show={true}
          xpEarned={Number(submitResult?.pointsEarned || 0)}
          streakBonus={Math.floor(score * 0.1)}
          ecoImpact={gameConfig.ecoImpact}
          gameName={gameConfig.name}
          masteryData={submitResult?.mastery || null}
          capInfo={submitResult?.capInfo || null}
          onPlayAgain={() => { playClick(); window.location.reload(); }}
          onClose={() => { playClick(); navigate("/mini-games"); }}
        />
      </div>
    );
  }

  return (
    <div className="trivia-race-container">
      <div className="game-header">
        <h1>Eco Trivia Race</h1>
        <div className="game-stats">
          <div className="stat"><span>Score:</span><span>{score}</span></div>
          <div className="stat"><span>Streak:</span><span>{streak}</span></div>
          <div className="stat"><span>Q:</span><span>{currentQ + 1}/{questions.length}</span></div>
        </div>
      </div>

      <div className="timer-bar">
        <div className="timer-fill" style={{ width: `${(timeLeft / initialTime) * 100}%` }}></div>
        <span className="timer-text">{timeLeft}s</span>
      </div>

      <div className="question-card">
        <h2>{active?.question || "Question"}</h2>
        <div className="answers-grid">
          {(active?.options || []).map((answer, index) => (
            <button key={index} className="answer-btn" onClick={(e) => handleAnswer(index, e)}>
              {answer}
            </button>
          ))}
        </div>
      </div>
      <MiniGameDebugPanel
        gameId="eco-trivia-race"
        level={level}
        run={run}
        submitting={submitting}
        submitResult={submitResult}
      />
    </div>
  );
}

export default EcoTriviaRace;