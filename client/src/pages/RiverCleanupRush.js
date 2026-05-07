import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Waves } from "lucide-react";
import gamesConfig from "../data/gamesConfig";
import CanvasGameShell from "../components/CanvasGameShell";
import useMiniGameRun from "../hooks/useMiniGameRun";
import MiniGameDebugPanel from "../components/game/MiniGameDebugPanel";

export default function RiverCleanupRush() {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameOver, setGameOver] = useState(false);
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(window.location.search);
  const level = parseInt(searchParams.get("level"), 10) || 1;
  const gameConfig = gamesConfig.find((g) => g.id === "river-cleanup-rush");
  const { run, submitting, submitResult, submitScore } = useMiniGameRun({ gameId: "river-cleanup-rush", level });

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

    const boat = { x: width / 2, y: height - 48, w: 72, h: 20, vx: 0 };
    let tick = 0;
    const trash = [];
    const spawnGap = Math.max(20, 45 - level * 8);

    const keyDown = (e) => {
      if (e.key === "ArrowLeft") boat.vx = -5;
      if (e.key === "ArrowRight") boat.vx = 5;
    };
    const keyUp = () => { boat.vx = 0; };
    window.addEventListener("keydown", keyDown);
    window.addEventListener("keyup", keyUp);

    const draw = () => {
      tick += 1;
      ctx.clearRect(0, 0, width, height);

      // water gradient background
      const bg = ctx.createLinearGradient(0, 0, 0, height);
      bg.addColorStop(0, "#dff7ff");
      bg.addColorStop(1, "#8bd3e6");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, width, height);

      // animated waves
      ctx.strokeStyle = "rgba(255,255,255,0.55)";
      for (let i = 0; i < 4; i += 1) {
        ctx.beginPath();
        for (let x = 0; x < width; x += 8) {
          const y = 50 + i * 22 + Math.sin((x + tick * 2 + i * 30) * 0.03) * 4;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      if (tick % spawnGap === 0) {
        trash.push({
          x: 20 + Math.random() * (width - 40),
          y: -10,
          r: 8 + Math.random() * 8,
          speed: 1.8 + Math.random() * (1 + level),
        });
      }

      boat.x = Math.max(12, Math.min(width - boat.w - 12, boat.x + boat.vx));
      ctx.fillStyle = "#0f172a";
      ctx.fillRect(boat.x, boat.y, boat.w, boat.h);
      ctx.fillStyle = "#334155";
      ctx.fillRect(boat.x + 20, boat.y - 8, 32, 8);

      for (let i = trash.length - 1; i >= 0; i -= 1) {
        const t = trash[i];
        t.y += t.speed;
        ctx.beginPath();
        ctx.arc(t.x, t.y, t.r, 0, Math.PI * 2);
        ctx.fillStyle = "#6b7280";
        ctx.fill();

        const inCatchX = t.x > boat.x && t.x < boat.x + boat.w;
        const inCatchY = t.y + t.r >= boat.y && t.y - t.r <= boat.y + boat.h;
        if (inCatchX && inCatchY) {
          trash.splice(i, 1);
          setScore((s) => s + 12);
          continue;
        }
        if (t.y - t.r > height) {
          trash.splice(i, 1);
          setScore((s) => Math.max(0, s - 6));
        }
      }

      raf = requestAnimationFrame(draw);
    };

    draw();
    animationRef.current = raf;
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", keyDown);
      window.removeEventListener("keyup", keyUp);
    };
  }, [gameOver, level]);

  async function endGame() {
    if (gameOver) return;
    setGameOver(true);
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    await submitScore({ score, timeSpent: 60 - timeLeft });
  }

  return (
    <CanvasGameShell
      title="River Cleanup Rush"
      titleIcon={Waves}
      titleIconClassName="text-cyan-600"
      score={score}
      timeLeft={timeLeft}
      backgroundClassName="bg-slate-50"
      headerBorderClassName="border-slate-200"
      canvasCardBorderClassName="border-slate-200"
      canvasBackgroundClassName="bg-cyan-50"
      canvasRef={canvasRef}
      onBack={() => navigate("/mini-games")}
      onEndGame={endGame}
      gameOver={gameOver}
      debugPanel={
        <MiniGameDebugPanel
          gameId="river-cleanup-rush"
          level={level}
          run={run}
          submitting={submitting}
          submitResult={submitResult}
        />
      }
      modalProps={{
        xpEarned: Number(submitResult?.pointsEarned || 0),
        streakBonus: Math.floor(score * 0.1),
        ecoImpact: gameConfig?.ecoImpact,
        gameName: gameConfig?.name || "River Cleanup Rush",
        masteryData: submitResult?.mastery || null,
        capInfo: submitResult?.capInfo || null,
        onPlayAgain: () => window.location.reload(),
        onClose: () => navigate("/mini-games"),
      }}
    />
  );
}
