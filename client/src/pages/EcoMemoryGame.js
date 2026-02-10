import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./EcoMemoryGame.css";

const ecoCards = [
  { id: 1, content: "🌱", fact: "Plants produce oxygen" },
  { id: 2, content: "🌱", fact: "Plants produce oxygen" },
  { id: 3, content: "♻️", fact: "Recycling saves energy" },
  { id: 4, content: "♻️", fact: "Recycling saves energy" },
  { id: 5, content: "💧", fact: "Water is precious" },
  { id: 6, content: "💧", fact: "Water is precious" },
  { id: 7, content: "🌞", fact: "Solar energy is renewable" },
  { id: 8, content: "🌞", fact: "Solar energy is renewable" },
  { id: 9, content: "🌍", fact: "Earth needs protection" },
  { id: 10, content: "🌍", fact: "Earth needs protection" },
  { id: 11, content: "🐝", fact: "Bees pollinate plants" },
  { id: 12, content: "🐝", fact: "Bees pollinate plants" }
];

function EcoMemoryGame() {
  const [cards, setCards] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);
  const [matchedCards, setMatchedCards] = useState([]);
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [timeLeft, setTimeLeft] = useState(90);
  const navigate = useNavigate();

  useEffect(() => {
    initializeGame();
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (matchedCards.length === cards.length && cards.length > 0) {
      setTimeout(() => endGame(), 1000);
    }
  }, [matchedCards, cards]);

  const initializeGame = () => {
    const shuffled = [...ecoCards].sort(() => Math.random() - 0.5);
    setCards(shuffled);
  };

  const handleCardClick = (index) => {
    if (flippedCards.length === 2 || flippedCards.includes(index) || matchedCards.includes(index)) {
      return;
    }

    const newFlipped = [...flippedCards, index];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(prev => prev + 1);
      const [first, second] = newFlipped;
      
      if (cards[first].content === cards[second].content) {
        setMatchedCards(prev => [...prev, first, second]);
        setScore(prev => prev + 20);
        setFlippedCards([]);
      } else {
        setTimeout(() => setFlippedCards([]), 1000);
      }
    }
  };

  const endGame = async () => {
    setGameOver(true);
    const finalScore = matchedCards.length === cards.length ? score + (timeLeft * 2) : score;
    
    try {
      const token = localStorage.getItem("token");
      await fetch("http://localhost:5000/api/mini-games/submit-score", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          gameId: "eco-memory",
          score: finalScore,
          timeSpent: 90 - timeLeft
        }),
      });
    } catch (error) {
      console.error("Error submitting score:", error);
    }
  };

  if (gameOver) {
    const finalScore = matchedCards.length === cards.length ? score + (timeLeft * 2) : score;
    return (
      <div className="game-over-container">
        <div className="game-over-card">
          <h1>{matchedCards.length === cards.length ? "🎉 Perfect!" : "⏰ Time's Up!"}</h1>
          <div className="final-score">
            <span className="score-value">{finalScore}</span>
            <span className="score-label">points</span>
          </div>
          <p>Matches: {matchedCards.length / 2} / {cards.length / 2}</p>
          <p>Moves: {moves}</p>
          <div className="game-actions">
            <button onClick={() => window.location.reload()} className="play-again-btn">
              🔄 Play Again
            </button>
            <button onClick={() => navigate("/mini-games")} className="back-btn">
              ← Back to Games
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="memory-game-container">
      <div className="game-header">
        <h1>🧠 Eco Memory Game</h1>
        <div className="game-stats">
          <div className="stat">
            <span className="stat-label">Score:</span>
            <span className="stat-value">{score}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Moves:</span>
            <span className="stat-value">{moves}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Time:</span>
            <span className="stat-value">{timeLeft}s</span>
          </div>
        </div>
      </div>

      <div className="cards-grid">
        {cards.map((card, index) => (
          <div
            key={index}
            className={`memory-card ${
              flippedCards.includes(index) || matchedCards.includes(index) ? 'flipped' : ''
            } ${matchedCards.includes(index) ? 'matched' : ''}`}
            onClick={() => handleCardClick(index)}
          >
            <div className="card-front">?</div>
            <div className="card-back">
              <div className="card-emoji">{card.content}</div>
              <div className="card-fact">{card.fact}</div>
            </div>
          </div>
        ))}
      </div>

      <button 
        className="quit-btn"
        onClick={() => navigate("/mini-games")}
      >
        ← Quit Game
      </button>
    </div>
  );
}

export default EcoMemoryGame;