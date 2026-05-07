import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./ClimateHeroGame.css";
import useFeedback from "../hooks/useFeedback";
import useSound from "../hooks/useSound";
import { getXPPositionFromEvent } from "../utils/xpPosition";
import GameRewardModal from "../components/GameRewardModal";
import gamesConfig from "../data/gamesConfig";
import { Recycle, Leaf, Droplets, Sun, Bike, Factory, Flame, Wind, Shield } from "lucide-react";
import useMiniGameRun from "../hooks/useMiniGameRun";
import MiniGameDebugPanel from "../components/game/MiniGameDebugPanel";

const ITEM_ICON = {
  recycle: Recycle,
  leaf: Leaf,
  water: Droplets,
  sun: Sun,
  bike: Bike,
  factory: Factory,
  fire: Flame,
  wind: Wind,
};

function ClimateHeroGame() {
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const [items, setItems] = useState([]);
  const [heroPosition, setHeroPosition] = useState(50);
  const [timeLeft, setTimeLeft] = useState(45);
  
  const searchParams = new URLSearchParams(window.location.search);
  const level = parseInt(searchParams.get("level")) || 1;
  const goodRatio = level === 1 ? 0.3 : level === 2 ? 0.5 : 0.7; // > threshold is good.
  
  const navigate = useNavigate();
  const { triggerXP, triggerSuccess } = useFeedback();
  const { playClick } = useSound();
  const gameConfig = gamesConfig.find(g => g.id === "climate-hero");
  const { run, submitting, submitResult, submitScore } = useMiniGameRun({ gameId: "climate-hero", level });

  useEffect(() => {
    const gameLoop = setInterval(() => {
      setItems(prev => {
        const newItems = prev.map(item => ({ ...item, y: item.y + 2 })).filter(item => item.y < 100);
        if (Math.random() < 0.05) {
          const isGood = Math.random() > goodRatio;
          const goodItems = ["recycle", "leaf", "water", "sun", "bike"];
          const badItems = ["factory", "wind", "fire", "factory"];
          newItems.push({
            id: Date.now(),
            icon: isGood ? goodItems[Math.floor(Math.random() * goodItems.length)] : badItems[Math.floor(Math.random() * badItems.length)],
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    items.forEach(item => {
      if (item.y > 85 && item.y < 95 && Math.abs(item.x - heroPosition) < 8) {
        if (item.isGood) {
          setScore(prev => prev + 15);
          triggerXP(15, { x: window.innerWidth * 0.5, y: window.innerHeight * 0.45 });
        } else {
          setScore(prev => Math.max(0, prev - 10));
          setLives(prev => prev - 1 <= 0 ? (endGame(), 0) : prev - 1);
        }
        setItems(prev => prev.filter(i => i.id !== item.id));
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    triggerSuccess();
    await submitScore({ score, timeSpent: 45 - timeLeft });
  };

  if (gameOver) {
    return (
      <div className="climate-hero-container">
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
    <div className="climate-hero-container">
      <div className="game-header">
        <h1>Climate Hero</h1>
        <div className="game-stats">
          <div className="stat"><span>Score:</span><span>{score}</span></div>
          <div className="stat"><span>Lives:</span><span>{lives}</span></div>
          <div className="stat"><span>Time:</span><span>{timeLeft}s</span></div>
        </div>
      </div>
      <div className="game-instructions">Use ← → arrows to catch good items, avoid bad ones!</div>
      <div className="game-area">
        {items.map(item => (
          <div key={item.id} className={`falling-item ${item.isGood ? 'good' : 'bad'}`} style={{ left: `${item.x}%`, top: `${item.y}%` }}>
            {(() => {
              const Icon = ITEM_ICON[item.icon] || Factory;
              return <Icon className="w-7 h-7" />;
            })()}
          </div>
        ))}
        <div className="hero" style={{ left: `${heroPosition}%` }}><Shield className="w-10 h-10" /></div>
      </div>
      <div className="controls">
        <button
          onClick={(e) => {
            playClick();
            setHeroPosition((prev) => Math.max(5, prev - 10));
            triggerXP(1, getXPPositionFromEvent(e, { y: window.innerHeight * 0.82 }));
          }}
        >
          ← Left
        </button>
        <button
          onClick={(e) => {
            playClick();
            setHeroPosition((prev) => Math.min(95, prev + 10));
            triggerXP(1, getXPPositionFromEvent(e, { y: window.innerHeight * 0.82 }));
          }}
        >
          Right →
        </button>
      </div>
      <MiniGameDebugPanel
        gameId="climate-hero"
        level={level}
        run={run}
        submitting={submitting}
        submitResult={submitResult}
      />
    </div>
  );
}

export default ClimateHeroGame;