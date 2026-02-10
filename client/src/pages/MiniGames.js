import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./MiniGames.css";

function MiniGames() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/mini-games", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setGames(data);
      }
    } catch (error) {
      console.error("Error fetching games:", error);
    } finally {
      setLoading(false);
    }
  };

  const getGameIcon = (type) => {
    const icons = {
      sorting: "♻️",
      matching: "🔗",
      memory: "🧠",
      quiz: "❓"
    };
    return icons[type] || "🎮";
  };

  const getCategoryColor = (category) => {
    const colors = {
      "waste-management": "#4CAF50",
      "energy": "#FF9800",
      "water": "#2196F3",
      "biodiversity": "#8BC34A",
      "climate": "#607D8B"
    };
    return colors[category] || "#9E9E9E";
  };

  const handlePlayGame = (gameType) => {
    navigate(`/mini-game/${gameType}`);
  };

  if (loading) return <div className="loading">Loading games...</div>;

  return (
    <div className="mini-games-container">
      <div className="games-header">
        <h1>🎮 Eco Mini-Games</h1>
        <p>Learn about environment through fun interactive games!</p>
        <button className="back-btn" onClick={() => navigate("/dashboard")}>
          ← Back to Dashboard
        </button>
      </div>

      <div className="games-grid">
        <div className="game-card" onClick={() => handlePlayGame("waste-sorting")}>
          <div className="game-icon">♻️</div>
          <h3>Waste Sorting Game</h3>
          <p>Sort different types of waste into correct bins</p>
          <div className="game-meta">
            <span className="difficulty easy">Easy</span>
            <span className="points">+15 pts</span>
          </div>
        </div>

        <div className="game-card" onClick={() => handlePlayGame("eco-memory")}>
          <div className="game-icon">🧠</div>
          <h3>Eco Memory Game</h3>
          <p>Match pairs of environmental facts and images</p>
          <div className="game-meta">
            <span className="difficulty easy">Easy</span>
            <span className="points">+12 pts</span>
          </div>
        </div>

        <div className="game-card" onClick={() => handlePlayGame("climate-hero")}>
          <div className="game-icon">🌍</div>
          <h3>Climate Hero</h3>
          <p>Catch good items and avoid pollution!</p>
          <div className="game-meta">
            <span className="difficulty medium">Medium</span>
            <span className="points">+20 pts</span>
          </div>
        </div>

        <div className="game-card" onClick={() => handlePlayGame("trivia-race")}>
          <div className="game-icon">⚡</div>
          <h3>Eco Trivia Race</h3>
          <p>Fast-paced environmental quiz challenge</p>
          <div className="game-meta">
            <span className="difficulty medium">Medium</span>
            <span className="points">+25 pts</span>
          </div>
        </div>

        <div className="game-card" onClick={() => handlePlayGame("plant-growth")}>
          <div className="game-icon">🌱</div>
          <h3>Plant Growth Game</h3>
          <p>Grow a plant by managing water and sunlight</p>
          <div className="game-meta">
            <span className="difficulty easy">Easy</span>
            <span className="points">+18 pts</span>
          </div>
        </div>
      </div>

      <div className="games-footer">
        <button 
          className="history-btn"
          onClick={() => navigate("/game-history")}
        >
          📊 View Game History
        </button>
      </div>
    </div>
  );
}

export default MiniGames;