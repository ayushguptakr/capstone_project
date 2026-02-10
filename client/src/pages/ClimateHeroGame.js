import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./ClimateHeroGame.css";

function ClimateHeroGame() {
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const [items, setItems] = useState([]);
  const [heroPosition, setHeroPosition] = useState(50);
  const [timeLeft, setTimeLeft] = useState(45);
  const navigate = useNavigate();

  useEffect(() => {
    const gameLoop = setInterval(() => {
      setItems(prev => {
        const newItems = prev.map(item => ({ ...item, y: item.y + 2 })).filter(item => item.y < 100);
        if (Math.random() < 0.05) {
          const isGood = Math.random() > 0.4;
          const goodItems = ["♻️", "🌱", "💧", "🌞", "🚲"];
          const badItems = ["🏭", "🛢️", "🔥", "💨"];
          newItems.push({
            id: Date.now(),
            emoji: isGood ? goodItems[Math.floor(Math.random() * goodItems.length)] : badItems[Math.floor(Math.random() * badItems.length)],
            x: Math.random() * 80 + 10,
            y: 0,
            isGood
          });
        }
        return newItems;
      });
    }, 50);

    const timer = setInterval(() => {
      setTimeLeft(prev => prev <= 1 ? (endGame(), 0) : prev - 1);
    }, 1000);

    return () => { clearInterval(gameLoop); clearInterval(timer); };
  }, []);

  useEffect(() => {
    items.forEach(item => {
      if (item.y > 85 && item.y < 95 && Math.abs(item.x - heroPosition) < 8) {
        if (item.isGood) {
          setScore(prev => prev + 15);
        } else {
          setScore(prev => Math.max(0, prev - 10));
          setLives(prev => prev - 1 <= 0 ? (endGame(), 0) : prev - 1);
        }
        setItems(prev => prev.filter(i => i.id !== item.id));
      }
    });
  }, [items, heroPosition]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "ArrowLeft") setHeroPosition(prev => Math.max(5, prev - 5));
      if (e.key === "ArrowRight") setHeroPosition(prev => Math.min(95, prev + 5));
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  const endGame = async () => {
    setGameOver(true);
    try {
      const token = localStorage.getItem("token");
      await fetch("http://localhost:5000/api/mini-games/submit-score", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ gameId: "climate-hero", score, timeSpent: 45 - timeLeft })
      });
    } catch (error) {}
  };

  if (gameOver) {
    return (
      <div className="game-over-container">
        <div className="game-over-card">
          <h1>🌍 Climate Hero!</h1>
          <div className="final-score">
            <span className="score-value">{score}</span>
            <span className="score-label">points</span>
          </div>
          <div className="game-actions">
            <button onClick={() => window.location.reload()} className="play-again-btn">🔄 Play Again</button>
            <button onClick={() => navigate("/mini-games")} className="back-btn">← Back</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="climate-hero-container">
      <div className="game-header">
        <h1>🌍 Climate Hero</h1>
        <div className="game-stats">
          <div className="stat"><span>Score:</span><span>{score}</span></div>
          <div className="stat"><span>Lives:</span><span>{"❤️".repeat(lives)}</span></div>
          <div className="stat"><span>Time:</span><span>{timeLeft}s</span></div>
        </div>
      </div>
      <div className="game-instructions">Use ← → arrows to catch good items, avoid bad ones!</div>
      <div className="game-area">
        {items.map(item => (
          <div key={item.id} className={`falling-item ${item.isGood ? 'good' : 'bad'}`} style={{ left: `${item.x}%`, top: `${item.y}%` }}>
            {item.emoji}
          </div>
        ))}
        <div className="hero" style={{ left: `${heroPosition}%` }}>🦸</div>
      </div>
      <div className="controls">
        <button onClick={() => setHeroPosition(prev => Math.max(5, prev - 10))}>← Left</button>
        <button onClick={() => setHeroPosition(prev => Math.min(95, prev + 10))}>Right →</button>
      </div>
    </div>
  );
}

export default ClimateHeroGame;