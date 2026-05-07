import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sun } from "lucide-react";
import gamesConfig from "../data/gamesConfig";
import CanvasGameShell from "../components/CanvasGameShell";
import useMiniGameRun from "../hooks/useMiniGameRun";
import MiniGameDebugPanel from "../components/game/MiniGameDebugPanel";

export default function SolarSprint() {
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(50);
  const [gameOver, setGameOver] = useState(false);
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(window.location.search);
  const level = parseInt(searchParams.get("level"), 10) || 1;
  const gameConfig = gamesConfig.find((g) => g.id === "solar-sprint");
  const { run, submitting, submitResult, submitScore } = useMiniGameRun({ gameId: "solar-sprint", level });

  useEffect(() => {
    if (gameOver) return undefined;
    const timer = setInterval(() => setTimeLeft((t) => (t <= 1 ? 0 : t - 1)), 1000);
    return () => clearInterval(timer);
  }, [gameOver]);

  useEffect(() => {
    if (timeLeft === 0 && !gameOver) {
      endGame();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || gameOver) return undefined;
    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;
    let raf;
    let tick = 0;
    const player = { x: width / 2, y: height - 40, r: 14 };
    const orbs = [];

    const spawnRate = Math.max(15, 36 - level * 7);
    const move = (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * width;
      player.x = Math.max(player.r, Math.min(width - player.r, x));
    };
    canvas.addEventListener("mousemove", move);

    const loop = () => {
      tick += 1;
      ctx.clearRect(0, 0, width, height);
      const grad = ctx.createLinearGradient(0, 0, 0, height);
      grad.addColorStop(0, "#fff7d6");
      grad.addColorStop(1, "#ffd166");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      if (tick % spawnRate === 0) {
        orbs.push({
          x: 12 + Math.random() * (width - 24),
          y: -8,
          speed: 2 + Math.random() * (2 + level * 0.5),
          good: Math.random() > 0.2,
        });
      }

      for (let i = orbs.length - 1; i >= 0; i -= 1) {
        const o = orbs[i];
        o.y += o.speed;
        ctx.beginPath();
        ctx.arc(o.x, o.y, 8, 0, Math.PI * 2);
        ctx.fillStyle = o.good ? "#16a34a" : "#ef4444";
        ctx.fill();
        if (Math.hypot(o.x - player.x, o.y - player.y) < player.r + 8) {
          setScore((s) => s + (o.good ? 10 : -8));
          orbs.splice(i, 1);
          continue;
        }
        if (o.y > height + 12) orbs.splice(i, 1);
      }

      ctx.beginPath();
      ctx.arc(player.x, player.y, player.r, 0, Math.PI * 2);
      ctx.fillStyle = "#1e293b";
      ctx.fill();
      ctx.fillStyle = "#f8fafc";
      ctx.fillRect(player.x - 4, player.y - 8, 8, 16);

      raf = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      cancelAnimationFrame(raf);
      canvas.removeEventListener("mousemove", move);
    };
  }, [gameOver, level]);

  async function endGame() {
    if (gameOver) return;
    setGameOver(true);
    await submitScore({ score: Math.max(0, score), timeSpent: 50 - timeLeft });
  }

  return (
    <CanvasGameShell
      title="Solar Sprint"
      titleIcon={Sun}
      titleIconClassName="text-amber-500"
      score={Math.max(0, score)}
      timeLeft={timeLeft}
      backgroundClassName="bg-amber-50"
      headerBorderClassName="border-amber-200"
      canvasCardBorderClassName="border-amber-200"
      canvasBackgroundClassName="bg-amber-100"
      canvasRef={canvasRef}
      onBack={() => navigate("/mini-games")}
      onEndGame={endGame}
      gameOver={gameOver}
      debugPanel={
        <MiniGameDebugPanel
          gameId="solar-sprint"
          level={level}
          run={run}
          submitting={submitting}
          submitResult={submitResult}
        />
      }
      modalProps={{
        xpEarned: Number(submitResult?.pointsEarned || 0),
        streakBonus: Math.floor(Math.max(0, score) * 0.1),
        ecoImpact: gameConfig?.ecoImpact,
        gameName: gameConfig?.name || "Solar Sprint",
        masteryData: submitResult?.mastery || null,
        capInfo: submitResult?.capInfo || null,
        onPlayAgain: () => window.location.reload(),
        onClose: () => navigate("/mini-games"),
      }}
    />
  );
}
