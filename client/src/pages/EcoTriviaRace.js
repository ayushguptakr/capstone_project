import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./EcoTriviaRace.css";
import useFeedback from "../hooks/useFeedback";
import useSound from "../hooks/useSound";
import { apiRequest } from "../api/httpClient";

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
  const [timeLeft, setTimeLeft] = useState(10);
  const [gameOver, setGameOver] = useState(false);
  const [streak, setStreak] = useState(0);
  const navigate = useNavigate();
  const { triggerXPFromEvent, triggerSuccess } = useFeedback();
  const { playClick } = useSound();

  useEffect(() => {
    if (timeLeft <= 0) {
      nextQuestion();
      return;
    }
    const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft]);

  const handleAnswer = (index, event) => {
    playClick();
    if (index === questions[currentQ].c) {
      const points = 10 + (timeLeft * 2) + (streak * 5);
      setScore(score + points);
      setStreak(streak + 1);
      triggerXPFromEvent(points, event, { y: window.innerHeight * 0.45 });
    } else {
      setStreak(0);
    }
    nextQuestion();
  };

  const nextQuestion = () => {
    if (currentQ >= questions.length - 1) {
      endGame();
    } else {
      setCurrentQ(currentQ + 1);
      setTimeLeft(10);
    }
  };

  const endGame = async () => {
    setGameOver(true);
    triggerSuccess();
    try {
      await apiRequest("/api/mini-games/submit-score", {
        method: "POST",
        body: { gameId: "eco-trivia-race", score, timeSpent: (questions.length * 10) - timeLeft },
        retries: 0,
      });
    } catch (error) {}
  };

  if (gameOver) {
    return (
      <div className="game-over-container">
        <div className="game-over-card">
          <h1>🏁 Race Complete!</h1>
          <div className="final-score">
            <span className="score-value">{score}</span>
            <span className="score-label">points</span>
          </div>
          <p>Questions: {currentQ + 1}/{questions.length}</p>
          <div className="game-actions">
            <button onClick={() => { playClick(); window.location.reload(); }} className="play-again-btn">🔄 Play Again</button>
            <button onClick={() => { playClick(); navigate("/mini-games"); }} className="back-btn">← Back</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="trivia-race-container">
      <div className="game-header">
        <h1>⚡ Eco Trivia Race</h1>
        <div className="game-stats">
          <div className="stat"><span>Score:</span><span>{score}</span></div>
          <div className="stat"><span>Streak:</span><span>{streak}🔥</span></div>
          <div className="stat"><span>Q:</span><span>{currentQ + 1}/{questions.length}</span></div>
        </div>
      </div>

      <div className="timer-bar">
        <div className="timer-fill" style={{ width: `${(timeLeft / 10) * 100}%` }}></div>
        <span className="timer-text">{timeLeft}s</span>
      </div>

      <div className="question-card">
        <h2>{questions[currentQ].q}</h2>
        <div className="answers-grid">
          {questions[currentQ].a.map((answer, index) => (
            <button key={index} className="answer-btn" onClick={(e) => handleAnswer(index, e)}>
              {answer}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default EcoTriviaRace;