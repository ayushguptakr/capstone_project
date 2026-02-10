import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./WasteSortingGame.css";

const wasteItems = [
  { id: 1, name: "Plastic Bottle", type: "recyclable", emoji: "🍼" },
  { id: 2, name: "Banana Peel", type: "organic", emoji: "🍌" },
  { id: 3, name: "Glass Jar", type: "recyclable", emoji: "🫙" },
  { id: 4, name: "Battery", type: "hazardous", emoji: "🔋" },
  { id: 5, name: "Apple Core", type: "organic", emoji: "🍎" },
  { id: 6, name: "Newspaper", type: "recyclable", emoji: "📰" },
  { id: 7, name: "Paint Can", type: "hazardous", emoji: "🎨" },
  { id: 8, name: "Food Scraps", type: "organic", emoji: "🥬" }
];

function WasteSortingGame() {
  const [currentItems, setCurrentItems] = useState([]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [timeLeft, setTimeLeft] = useState(60);
  const navigate = useNavigate();

  useEffect(() => {
    shuffleItems();
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

  const shuffleItems = () => {
    const shuffled = [...wasteItems].sort(() => Math.random() - 0.5);
    setCurrentItems(shuffled.slice(0, 6));
  };

  const handleDrop = (itemId, binType) => {
    const item = currentItems.find(i => i.id === itemId);
    if (item.type === binType) {
      setScore(prev => prev + 10);
      setFeedback("✅ Correct! Well done!");
      setCurrentItems(prev => prev.filter(i => i.id !== itemId));
      
      if (currentItems.length === 1) {
        setTimeout(() => shuffleItems(), 1000);
      }
    } else {
      setScore(prev => Math.max(0, prev - 5));
      setFeedback("❌ Wrong bin! Try again.");
    }

    setTimeout(() => setFeedback(""), 2000);
  };

  const endGame = async () => {
    setGameOver(true);
    try {
      const token = localStorage.getItem("token");
      await fetch("http://localhost:5000/api/mini-games/submit-score", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          gameId: "waste-sorting",
          score,
          timeSpent: 60 - timeLeft
        }),
      });
    } catch (error) {
      console.error("Error submitting score:", error);
    }
  };

  const allowDrop = (e) => e.preventDefault();
  const drag = (e) => e.dataTransfer.setData("text", e.target.id);
  const drop = (e, binType) => {
    e.preventDefault();
    const itemId = parseInt(e.dataTransfer.getData("text"));
    handleDrop(itemId, binType);
  };

  if (gameOver) {
    return (
      <div className="game-over-container">
        <div className="game-over-card">
          <h1>🎉 Game Complete!</h1>
          <div className="final-score">
            <span className="score-value">{score}</span>
            <span className="score-label">points</span>
          </div>
          <p>Great job learning about waste sorting!</p>
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
    <div className="waste-sorting-container">
      <div className="game-header">
        <h1>♻️ Waste Sorting Game</h1>
        <div className="game-stats">
          <div className="stat">
            <span className="stat-label">Score:</span>
            <span className="stat-value">{score}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Time:</span>
            <span className="stat-value">{timeLeft}s</span>
          </div>
        </div>
      </div>

      {feedback && (
        <div className={`feedback ${feedback.includes('✅') ? 'correct' : 'wrong'}`}>
          {feedback}
        </div>
      )}

      <div className="game-area">
        <div className="waste-items">
          <h3>Drag items to correct bins:</h3>
          <div className="items-grid">
            {currentItems.map(item => (
              <div
                key={item.id}
                id={item.id}
                className="waste-item"
                draggable
                onDragStart={drag}
              >
                <span className="item-emoji">{item.emoji}</span>
                <span className="item-name">{item.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bins-container">
          <div 
            className="bin recyclable"
            onDrop={(e) => drop(e, "recyclable")}
            onDragOver={allowDrop}
          >
            <div className="bin-icon">♻️</div>
            <div className="bin-label">Recyclable</div>
            <div className="bin-examples">Plastic, Glass, Paper</div>
          </div>

          <div 
            className="bin organic"
            onDrop={(e) => drop(e, "organic")}
            onDragOver={allowDrop}
          >
            <div className="bin-icon">🌱</div>
            <div className="bin-label">Organic</div>
            <div className="bin-examples">Food Waste, Peels</div>
          </div>

          <div 
            className="bin hazardous"
            onDrop={(e) => drop(e, "hazardous")}
            onDragOver={allowDrop}
          >
            <div className="bin-icon">⚠️</div>
            <div className="bin-label">Hazardous</div>
            <div className="bin-examples">Batteries, Chemicals</div>
          </div>
        </div>
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

export default WasteSortingGame;