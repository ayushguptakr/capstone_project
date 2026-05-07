import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./PlantGrowthGame.css";
import useFeedback from "../hooks/useFeedback";
import GameRewardModal from "../components/GameRewardModal";
import gamesConfig from "../data/gamesConfig";
import useSound from "../hooks/useSound";
import { Sprout, Leaf, Flower2, TreePine, Trees, Droplets, Sun, Lightbulb } from "lucide-react";
import useMiniGameRun from "../hooks/useMiniGameRun";
import MiniGameDebugPanel from "../components/game/MiniGameDebugPanel";

function PlantGrowthGame() {
  const [plantStage, setPlantStage] = useState(0);
  const [water, setWater] = useState(50);
  const [sunlight, setSunlight] = useState(50);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [message, setMessage] = useState("Take care of your plant!");
  const [timeLeft, setTimeLeft] = useState(60);
  
  const searchParams = new URLSearchParams(window.location.search);
  const level = parseInt(searchParams.get("level")) || 1;
  const decayRate = level === 1 ? 1 : level === 2 ? 2 : 4;
  
  const navigate = useNavigate();
  const { triggerXPFromEvent, triggerSuccess } = useFeedback();
  const { playClick } = useSound();
  const gameConfig = gamesConfig.find(g => g.id === "plant-growth");
  const { run, submitting, submitResult, submitScore } = useMiniGameRun({ gameId: "plant-growth", level });

  const plantStages = [
    { label: "Seedling", Icon: Sprout },
    { label: "Sprout", Icon: Leaf },
    { label: "Growing Plant", Icon: Flower2 },
    { label: "Young Tree", Icon: TreePine },
    { label: "Mature Tree", Icon: Trees },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setWater(prev => Math.max(0, prev - decayRate));
      setSunlight(prev => Math.max(0, prev - decayRate));
      
      if (water < 20 || sunlight < 20) {
        setMessage("Plant needs care.");
      } else if (water > 80 && sunlight > 80) {
        setMessage("Perfect conditions.");
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
          endGame(score + (plantStage * 100));
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [water, sunlight, plantStage, score, timeLeft]);

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

  const endGame = async (finalScore) => {
    setGameOver(true);
    triggerSuccess();
    await submitScore({ score: finalScore, timeSpent: 60 - timeLeft });
  };

  if (gameOver) {
    const finalScore = score + (plantStage * 100);
    return (
      <div className="plant-game-container">
        <GameRewardModal
          show={true}
          xpEarned={Number(submitResult?.pointsEarned || 0)}
          streakBonus={Math.floor(finalScore * 0.1)}
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
    <div className="plant-game-container">
      <div className="game-header">
        <h1>Plant Growth Game</h1>
        <div className="game-stats">
          <div className="stat"><span>Score:</span><span>{score}</span></div>
          <div className="stat"><span>Stage:</span><span>{plantStage + 1}/5</span></div>
          <div className="stat"><span>Time:</span><span>{timeLeft}s</span></div>
        </div>
      </div>

      <div className="message-box">{message}</div>

      <div className="plant-display-area">
        <div className="plant-emoji">
          {(() => {
            const StageIcon = plantStages[plantStage]?.Icon || Sprout;
            return <StageIcon className="w-28 h-28 text-emerald-700" />;
          })()}
          <div style={{ marginTop: "8px", fontWeight: 700, color: "#14532d", fontSize: "0.9rem" }}>
            {plantStages[plantStage]?.label}
          </div>
        </div>
      </div>

      <div className="resources">
        <div className="resource">
          <div className="resource-label"><Droplets className="w-4 h-4 inline-block mr-1" /> Water</div>
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
          <div className="resource-label"><Sun className="w-4 h-4 inline-block mr-1" /> Sunlight</div>
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
        <h3><Lightbulb className="w-4 h-4 inline-block mr-1" /> Tips:</h3>
        <p>• Keep water and sunlight above 20%</p>
        <p>• Maintain both above 80% for faster growth</p>
        <p>• Grow your plant to the final stage!</p>
      </div>
      <MiniGameDebugPanel
        gameId="plant-growth"
        level={level}
        run={run}
        submitting={submitting}
        submitResult={submitResult}
      />
    </div>
  );
}

export default PlantGrowthGame;