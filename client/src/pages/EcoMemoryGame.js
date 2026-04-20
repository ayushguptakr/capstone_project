import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./EcoMemoryGame.css";
import useFeedback from "../hooks/useFeedback";
import useSound from "../hooks/useSound";
import { apiRequest } from "../api/httpClient";
import GameRewardModal from "../components/GameRewardModal";
import gamesConfig from "../data/gamesConfig";

const ecoCards = [
  { id: 1, content: "🌱", fact: "Plants produce oxygen" }, { id: 2, content: "🌱", fact: "Plants produce oxygen" },
  { id: 3, content: "♻️", fact: "Recycling saves energy" }, { id: 4, content: "♻️", fact: "Recycling saves energy" },
  { id: 5, content: "💧", fact: "Water is precious" }, { id: 6, content: "💧", fact: "Water is precious" },
  { id: 7, content: "🌞", fact: "Solar energy is renewable" }, { id: 8, content: "🌞", fact: "Solar energy is renewable" },
  { id: 9, content: "🌍", fact: "Earth needs protection" }, { id: 10, content: "🌍", fact: "Earth needs protection" },
  { id: 11, content: "🐝", fact: "Bees pollinate plants" }, { id: 12, content: "🐝", fact: "Bees pollinate plants" },
  { id: 13, content: "🚲", fact: "Biking reduces emissions" }, { id: 14, content: "🚲", fact: "Biking reduces emissions" },
  { id: 15, content: "🌳", fact: "Forests are earth's lungs" }, { id: 16, content: "🌳", fact: "Forests are earth's lungs" },
  { id: 17, content: "🌊", fact: "Oceans regulate climate" }, { id: 18, content: "🌊", fact: "Oceans regulate climate" },
  { id: 19, content: "🔋", fact: "Rechargeable batteries rock" }, { id: 20, content: "🔋", fact: "Rechargeable batteries rock" },
  { id: 21, content: "🌻", fact: "Sunflowers absorb toxins" }, { id: 22, content: "🌻", fact: "Sunflowers absorb toxins" },
  { id: 23, content: "🍂", fact: "Compost feeds the soil" }, { id: 24, content: "🍂", fact: "Compost feeds the soil" }
];

function EcoMemoryGame() {
  const [cards, setCards] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);
  const [matchedCards, setMatchedCards] = useState([]);
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  
  const searchParams = new URLSearchParams(window.location.search);
  const level = parseInt(searchParams.get("level")) || 1;
  const initialTime = level === 1 ? 90 : level === 2 ? 75 : 60;
  const numCards = level === 1 ? 12 : level === 2 ? 16 : 24;

  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [masteryData, setMasteryData] = useState(null);
  const navigate = useNavigate();
  const { triggerXPFromEvent, triggerSuccess } = useFeedback();
  const { playClick } = useSound();
  const gameConfig = gamesConfig.find(g => g.id === "eco-memory");

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (matchedCards.length === cards.length && cards.length > 0) {
      setTimeout(() => endGame(), 1000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchedCards, cards]);

  const initializeGame = () => {
    const subset = ecoCards.slice(0, numCards);
    const shuffled = [...subset].sort(() => Math.random() - 0.5);
    setCards(shuffled);
  };

  const handleCardClick = (index, event) => {
    playClick();
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
        triggerXPFromEvent(20, event, { y: window.innerHeight * 0.42 });
        setFlippedCards([]);
      } else {
        setTimeout(() => setFlippedCards([]), 1000);
      }
    }
  };

  const endGame = async () => {
    setGameOver(true);
    const finalScore = matchedCards.length === cards.length ? score + (timeLeft * 2) : score;
    triggerSuccess();
    
    try {
      const resp = await apiRequest("/api/mini-games/submit-score", {
        method: "POST",
        body: {
          gameId: "eco-memory",
          level,
          score: finalScore,
          timeSpent: initialTime - timeLeft
        },
        retries: 0,
      });
      if (resp.mastery) {
        setMasteryData(resp.mastery);
      }
    } catch (error) {
      console.error("Error submitting score:", error);
    }
  };

  if (gameOver) {
    const finalScore = matchedCards.length === cards.length ? score + (timeLeft * 2) : score;
    return (
      <div className="memory-game-container">
        <GameRewardModal
          show={true}
          xpEarned={finalScore}
          streakBonus={Math.floor(finalScore * 0.1)}
          ecoImpact={gameConfig.ecoImpact}
          gameName={gameConfig.name}
          masteryData={masteryData}
          onPlayAgain={() => { playClick(); window.location.reload(); }}
          onClose={() => { playClick(); navigate("/mini-games"); }}
        />
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
            onClick={(e) => handleCardClick(index, e)}
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
        onClick={() => { playClick(); navigate("/mini-games"); }}
      >
        ← Quit Game
      </button>
    </div>
  );
}

export default EcoMemoryGame;