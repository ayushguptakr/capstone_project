import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./PlantGrowthGame.css";
import useFeedback from "../hooks/useFeedback";
import useSound from "../hooks/useSound";
import { apiRequest } from "../api/httpClient";

function PlantGrowthGame() {
  const [plantStage, setPlantStage] = useState(0);
  const [water, setWater] = useState(50);
  const [sunlight, setSunlight] = useState(50);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [message, setMessage] = useState("Take care of your plant!");
  const [timeLeft, setTimeLeft] = useState(60);
  const navigate = useNavigate();
  const { triggerXPFromEvent, triggerSuccess } = useFeedback();
  const { playClick } = useSound();

  const plantStages = ["🌱", "🌿", "🪴", "🌳", "🌲"];

  useEffect(() => {
    const timer = setInterval(() => {
      setWater(prev => Math.max(0, prev - 2));
      setSunlight(prev => Math.max(0, prev - 1));
      
      if (water < 20 || sunlight < 20) {
        setMessage("⚠️ Plant needs care!");
      } else if (water > 80 && sunlight > 80) {
        setMessage("🌟 Perfect conditions!");
        setScore(prev => prev + 5);
        if (plantStage < plantStages.length - 1 && Math.random() > 0.7) {
          setPlantStage(prev => prev + 1);
          setScore(prev => prev + 50);
        }
      } else {
        setMessage("Keep taking care!");
      }

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
  }, [water, sunlight, plantStage]);

  const addWater = () => {
    if (water < 100) {
      setWater(Math.min(100, water + 20));
      setScore(score + 2);
    }
  };

  const addSunlight = () => {
    if (sunlight < 100) {
      setSunlight(Math.min(100, sunlight + 15));
      setScore(score + 2);
    }
  };

  const endGame = async () => {
    setGameOver(true);
    const finalScore = score + (plantStage * 100);
    triggerSuccess();
    try {
      await apiRequest("/api/mini-games/submit-score", {
        method: "POST",
        body: { gameId: "plant-growth", score: finalScore, timeSpent: 60 - timeLeft },
        retries: 0,
      });
    } catch (error) {}
  };

  if (gameOver) {
    const finalScore = score + (plantStage * 100);
    return (
      <div className="game-over-container">
        <div className="game-over-card">
          <h1>🌳 Garden Complete!</h1>
          <div className="plant-display">{plantStages[plantStage]}</div>
          <div className="final-score">
            <span className="score-value">{finalScore}</span>
            <span className="score-label">points</span>
          </div>
          <p>Plant Stage: {plantStage + 1}/{plantStages.length}</p>
          <div className="game-actions">
            <button onClick={() => { playClick(); window.location.reload(); }} className="play-again-btn">🔄 Play Again</button>
            <button onClick={() => { playClick(); navigate("/mini-games"); }} className="back-btn">← Back</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="plant-game-container">
      <div className="game-header">
        <h1>🌱 Plant Growth Game</h1>
        <div className="game-stats">
          <div className="stat"><span>Score:</span><span>{score}</span></div>
          <div className="stat"><span>Stage:</span><span>{plantStage + 1}/5</span></div>
          <div className="stat"><span>Time:</span><span>{timeLeft}s</span></div>
        </div>
      </div>

      <div className="message-box">{message}</div>

      <div className="plant-display-area">
        <div className="plant-emoji">{plantStages[plantStage]}</div>
      </div>

      <div className="resources">
        <div className="resource">
          <div className="resource-label">💧 Water</div>
          <div className="resource-bar">
            <div className="resource-fill water" style={{ width: `${water}%` }}></div>
          </div>
          <button
            onClick={(e) => {
              playClick();
              addWater();
              triggerXPFromEvent(2, e, { y: window.innerHeight * 0.7 });
            }}
            className="resource-btn"
          >
            Add Water
          </button>
        </div>

        <div className="resource">
          <div className="resource-label">☀️ Sunlight</div>
          <div className="resource-bar">
            <div className="resource-fill sunlight" style={{ width: `${sunlight}%` }}></div>
          </div>
          <button
            onClick={(e) => {
              playClick();
              addSunlight();
              triggerXPFromEvent(2, e, { y: window.innerHeight * 0.7 });
            }}
            className="resource-btn"
          >
            Add Sunlight
          </button>
        </div>
      </div>

      <div className="tips">
        <h3>🌿 Tips:</h3>
        <p>• Keep water and sunlight above 20%</p>
        <p>• Maintain both above 80% for faster growth</p>
        <p>• Grow your plant to the final stage!</p>
      </div>
    </div>
  );
}

export default PlantGrowthGame;