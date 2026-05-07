import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./WasteSortingGame.css";
import useFeedback from "../hooks/useFeedback";
import useSound from "../hooks/useSound";
import GameRewardModal from "../components/GameRewardModal";
import gamesConfig from "../data/gamesConfig";
import { Recycle, Leaf, ShieldAlert, Package } from "lucide-react";
import useMiniGameRun from "../hooks/useMiniGameRun";
import MiniGameDebugPanel from "../components/game/MiniGameDebugPanel";

const wasteItems = [
  { id: 1, name: "Plastic Bottle", type: "recyclable", code: "PL" },
  { id: 2, name: "Banana Peel", type: "organic", code: "OR" },
  { id: 3, name: "Glass Jar", type: "recyclable", code: "GL" },
  { id: 4, name: "Battery", type: "hazardous", code: "HZ" },
  { id: 5, name: "Apple Core", type: "organic", code: "OR" },
  { id: 6, name: "Newspaper", type: "recyclable", code: "PP" },
  { id: 7, name: "Paint Can", type: "hazardous", code: "HZ" },
  { id: 8, name: "Food Scraps", type: "organic", code: "OR" }
];

function WasteSortingGame() {
  const [currentItems, setCurrentItems] = useState([]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [feedback, setFeedback] = useState("");
  
  const searchParams = new URLSearchParams(window.location.search);
  const level = parseInt(searchParams.get("level")) || 1;
  const initialTime = level === 1 ? 60 : level === 2 ? 45 : 30;
  const itemConfig = level === 1 ? 6 : level === 2 ? 8 : 10;
  
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const navigate = useNavigate();
  const { triggerXP, triggerSuccess } = useFeedback();
  const { playClick } = useSound();
  const gameConfig = gamesConfig.find(g => g.id === "waste-sorting");
  const { run, submitting, submitResult, submitScore } = useMiniGameRun({ gameId: "waste-sorting", level });

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const shuffleItems = () => {
    const shuffled = [...wasteItems].sort(() => Math.random() - 0.5);
    setCurrentItems(shuffled.slice(0, itemConfig));
  };

  const handleDrop = (itemId, binType, position) => {
    const item = currentItems.find(i => i.id === itemId);
    if (item.type === binType) {
      setScore(prev => prev + 10);
      triggerXP(10, position);
      setFeedback("Correct! Well done.");
      setCurrentItems(prev => prev.filter(i => i.id !== itemId));
      
      if (currentItems.length === 1) {
        setTimeout(() => shuffleItems(), 1000);
      }
    } else {
      setScore(prev => Math.max(0, prev - 5));
      setFeedback("Wrong bin. Try again.");
    }

    setTimeout(() => setFeedback(""), 2000);
  };

  const endGame = async () => {
    setGameOver(true);
    triggerSuccess();
    await submitScore({ score, timeSpent: initialTime - timeLeft });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  };

  const allowDrop = (e) => e.preventDefault();
  const drag = (e) => e.dataTransfer.setData("text", e.target.id);
  const drop = (e, binType) => {
    e.preventDefault();
    const itemId = parseInt(e.dataTransfer.getData("text"));
    handleDrop(itemId, binType, { x: e.clientX, y: e.clientY });
  };

  if (gameOver) {
    return (
      <div className="waste-sorting-container">
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
    <div className="waste-sorting-container ws-container">
      <div className="ws-header">
        <h1>Waste Sorting Game</h1>
        <div className="ws-stats">
          <div className="ws-stat">
            <span className="ws-stat-label">Score:</span>
            <span className="ws-stat-value">{score}</span>
          </div>
          <div className="ws-stat">
            <span className="ws-stat-label">Time:</span>
            <span className="ws-stat-value">{timeLeft}s</span>
          </div>
        </div>
      </div>

      {feedback && (
        <div className={`ws-feedback ${feedback.startsWith("Correct") ? 'correct' : 'wrong'}`}>
          {feedback}
        </div>
      )}

      <div className="ws-area">
        <div className="ws-items">
          <h3>Drag items to correct bins:</h3>
          <div className="ws-items-grid">
            {currentItems.map(item => (
              <div
                key={item.id}
                id={item.id}
                className="ws-item"
                draggable
                onDragStart={drag}
              >
                <span className={`ws-item-icon ws-item-${item.type}`}>
                  <Package className="w-5 h-5" />
                </span>
                <span className="ws-item-name">{item.name}</span>
                <span className="ws-item-code">{item.code}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="ws-bins">
          <div 
            className="ws-bin recyclable"
            onDrop={(e) => drop(e, "recyclable")}
            onDragOver={allowDrop}
          >
            <div className="ws-bin-icon"><Recycle className="w-8 h-8" /></div>
            <div className="ws-bin-label">Recyclable</div>
            <div className="ws-bin-examples">Plastic, Glass, Paper</div>
          </div>

          <div 
            className="ws-bin organic"
            onDrop={(e) => drop(e, "organic")}
            onDragOver={allowDrop}
          >
            <div className="ws-bin-icon"><Leaf className="w-8 h-8" /></div>
            <div className="ws-bin-label">Organic</div>
            <div className="ws-bin-examples">Food Waste, Peels</div>
          </div>

          <div 
            className="ws-bin hazardous"
            onDrop={(e) => drop(e, "hazardous")}
            onDragOver={allowDrop}
          >
            <div className="ws-bin-icon"><ShieldAlert className="w-8 h-8" /></div>
            <div className="ws-bin-label">Hazardous</div>
            <div className="ws-bin-examples">Batteries, Chemicals</div>
          </div>
        </div>
      </div>

      <button 
        className="ws-quit-btn"
        onClick={() => { playClick(); endGame(); }}
      >
        ← Quit Game
      </button>
      <MiniGameDebugPanel
        gameId="waste-sorting"
        level={level}
        run={run}
        submitting={submitting}
        submitResult={submitResult}
      />
    </div>
  );
}

export default WasteSortingGame;