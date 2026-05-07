import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Droplet, Sparkles } from "lucide-react";
import CanvasGameShell from "../components/CanvasGameShell";
import useMiniGameRun from "../hooks/useMiniGameRun";
import MiniGameDebugPanel from "../components/game/MiniGameDebugPanel";

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

export default function WaterCycleLab() {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(75);
  const [gameOver, setGameOver] = useState(false);
  const [toast, setToast] = useState(null);

  const searchParams = new URLSearchParams(window.location.search);
  const level = parseInt(searchParams.get("level"), 10) || 1;
  const { run, submitting, submitResult, submitScore } = useMiniGameRun({ gameId: "water-cycle-lab", level });

  const goalCycles = useMemo(() => (level >= 3 ? 3 : level === 2 ? 2 : 1), [level]);

  useEffect(() => {
    if (gameOver) return undefined;
    const timer = setInterval(() => setTimeLeft((t) => (t <= 1 ? 0 : t - 1)), 1000);
    return () => clearInterval(timer);
  }, [gameOver]);

  useEffect(() => {
    if (timeLeft === 0 && !gameOver) endGame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || gameOver) return undefined;
    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;
    let raf = 0;
    let tick = 0;

    // Control state
    let temp = 0.55; // 0..1
    let wind = 0.35; // 0..1
    let humidity = 0.25; // 0..1
    let cloud = 0.05; // 0..1
    let rainfall = 0; // 0..1
    let reservoir = 0.8; // 0..1
    let cycles = 0;

    const btns = [
      { id: "tempDown", x: 40, y: 330, w: 56, h: 44, label: "−", kind: "temp", delta: -0.08 },
      { id: "tempUp", x: 104, y: 330, w: 56, h: 44, label: "+", kind: "temp", delta: +0.08 },
      { id: "windDown", x: 40, y: 386, w: 56, h: 44, label: "−", kind: "wind", delta: -0.08 },
      { id: "windUp", x: 104, y: 386, w: 56, h: 44, label: "+", kind: "wind", delta: +0.08 },
    ];

    const getMouse = (e) => {
      const rect = canvas.getBoundingClientRect();
      return {
        x: ((e.clientX - rect.left) / rect.width) * width,
        y: ((e.clientY - rect.top) / rect.height) * height,
      };
    };
    const hit = (mx, my, r) => mx >= r.x && mx <= r.x + r.w && my >= r.y && my <= r.y + r.h;

    const click = (e) => {
      const { x: mx, y: my } = getMouse(e);
      const b = btns.find((r) => hit(mx, my, r));
      if (!b) return;
      if (b.kind === "temp") temp = clamp(temp + b.delta, 0.05, 0.95);
      if (b.kind === "wind") wind = clamp(wind + b.delta, 0.05, 0.95);
      setToast({
        ok: true,
        text: b.kind === "temp" ? "Temperature changes evaporation rate." : "Wind moves moist air and helps clouds form.",
      });
      window.setTimeout(() => setToast(null), 1200);
    };
    canvas.addEventListener("click", click);

    const roundRect = (x, y, w, h, r) => {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
    };

    const drawGauge = (x, y, w, label, val, color) => {
      ctx.fillStyle = "rgba(255,255,255,0.86)";
      ctx.strokeStyle = "rgba(15,23,42,0.12)";
      ctx.lineWidth = 2;
      roundRect(x, y, w, 52, 16);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#0f172a";
      ctx.font = "800 12px ui-sans-serif, system-ui, -apple-system, Segoe UI";
      ctx.fillText(label, x + 14, y + 20);
      ctx.fillStyle = "rgba(15,23,42,0.08)";
      roundRect(x + 14, y + 28, w - 28, 10, 999);
      ctx.fill();
      ctx.fillStyle = color;
      roundRect(x + 14, y + 28, Math.max(8, (w - 28) * clamp(val, 0, 1)), 10, 999);
      ctx.fill();
    };

    const loop = () => {
      tick += 1;
      ctx.clearRect(0, 0, width, height);

      // environment background
      const bg = ctx.createLinearGradient(0, 0, 0, height);
      bg.addColorStop(0, "#dbeafe");
      bg.addColorStop(0.55, "#ecfdf5");
      bg.addColorStop(1, "#e0f2fe");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, width, height);

      // water body
      ctx.fillStyle = "rgba(56,189,248,0.55)";
      ctx.beginPath();
      ctx.roundRect(26, 250, width - 52, 160, 24);
      ctx.fill();

      // simulate
      const evapRate = (0.002 + temp * 0.010) * (0.7 + wind * 0.6);
      const condRate = (humidity > 0.65 ? 0.012 : 0.004) * (0.6 + wind * 0.8);
      const rainRate = cloud > 0.75 ? 0.020 + (cloud - 0.75) * 0.03 : 0;

      // evaporation consumes reservoir, increases humidity
      const evap = Math.min(reservoir, evapRate);
      reservoir = clamp(reservoir - evap, 0, 1);
      humidity = clamp(humidity + evap * 1.5, 0, 1);

      // condensation converts humidity to cloud
      const cond = Math.min(humidity, condRate);
      humidity = clamp(humidity - cond, 0, 1);
      cloud = clamp(cloud + cond * 1.6, 0, 1);

      // rainfall converts cloud to reservoir (cycle)
      const rain = Math.min(cloud, rainRate);
      cloud = clamp(cloud - rain, 0, 1);
      rainfall = clamp(rainfall + rain * 4, 0, 1);
      reservoir = clamp(reservoir + rain * 1.25, 0, 1);
      rainfall = clamp(rainfall * 0.92, 0, 1);

      // cycle detection: when rainfall bursts above threshold after cloud build-up
      if (rain > 0.012) {
        // reward for controlled precipitation
        setScore((s) => clamp(s + 6, 0, 99999));
      }
      if (cloud < 0.15 && humidity < 0.25 && reservoir > 0.75 && tick % 60 === 0) {
        cycles += 1;
        setScore((s) => clamp(s + 55, 0, 99999));
        setToast({ ok: true, text: "Cycle complete: precipitation refilled the reservoir." });
        window.setTimeout(() => setToast(null), 1400);
      }

      // win condition boosts score
      if (cycles >= goalCycles && tick % 60 === 0) {
        setScore((s) => Math.max(s, 420 + cycles * 40));
      }

      // draw clouds
      const cloudCount = Math.round(3 + cloud * 8);
      for (let i = 0; i < cloudCount; i += 1) {
        const x = 180 + i * 70 + Math.sin((tick + i * 30) * 0.02) * (10 + wind * 20);
        const y = 90 + Math.cos((tick + i * 22) * 0.02) * 6;
        const r = 22 + cloud * 18;
        ctx.fillStyle = `rgba(255,255,255,${0.55 + cloud * 0.35})`;
        ctx.beginPath();
        ctx.ellipse(x, y, r * 1.6, r, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // draw rain
      if (rainRate > 0) {
        ctx.strokeStyle = `rgba(59,130,246,${0.15 + rainfall * 0.55})`;
        for (let i = 0; i < 45; i += 1) {
          const x = 160 + i * 14;
          const y = 140 + (tick * 4 + i * 9) % 140;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x - 6, y + 18);
          ctx.stroke();
        }
      }

      // header text
      ctx.fillStyle = "#0f172a";
      ctx.font = "bold 18px ui-sans-serif, system-ui, -apple-system, Segoe UI";
      ctx.fillText("Water Cycle Lab", 22, 36);
      ctx.fillStyle = "rgba(15,23,42,0.65)";
      ctx.font = "700 12px ui-sans-serif, system-ui, -apple-system, Segoe UI";
      ctx.fillText(`Complete ${goalCycles} full cycle(s). Control temperature + wind.`, 22, 56);

      // gauges
      drawGauge(22, 74, 300, "Temperature", temp, "rgba(245,158,11,0.95)");
      drawGauge(22, 132, 300, "Wind", wind, "rgba(56,189,248,0.95)");
      drawGauge(340, 74, 250, "Humidity", humidity, "rgba(16,185,129,0.95)");
      drawGauge(600, 74, 290, "Clouds", cloud, "rgba(100,116,139,0.95)");

      // buttons
      btns.forEach((b) => {
        ctx.fillStyle = "rgba(255,255,255,0.9)";
        ctx.strokeStyle = "rgba(15,23,42,0.12)";
        ctx.lineWidth = 2;
        roundRect(b.x, b.y, b.w, b.h, 14);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "#0f172a";
        ctx.font = "900 18px ui-sans-serif, system-ui, -apple-system, Segoe UI";
        ctx.fillText(b.label, b.x + 22, b.y + 30);
      });

      ctx.fillStyle = "rgba(15,23,42,0.75)";
      ctx.font = "800 12px ui-sans-serif, system-ui, -apple-system, Segoe UI";
      ctx.fillText("Temp", 174, 358);
      ctx.fillText("Wind", 174, 414);

      // reservoir indicator
      ctx.fillStyle = "rgba(255,255,255,0.86)";
      ctx.strokeStyle = "rgba(15,23,42,0.12)";
      ctx.lineWidth = 2;
      roundRect(340, 132, 550, 52, 16);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#0f172a";
      ctx.font = "800 12px ui-sans-serif, system-ui, -apple-system, Segoe UI";
      ctx.fillText("Reservoir", 358, 152);
      ctx.fillStyle = "rgba(15,23,42,0.08)";
      roundRect(358, 160, 510, 10, 999);
      ctx.fill();
      ctx.fillStyle = "rgba(59,130,246,0.95)";
      roundRect(358, 160, Math.max(8, 510 * reservoir), 10, 999);
      ctx.fill();

      // cycles
      ctx.fillStyle = "rgba(15,23,42,0.65)";
      ctx.font = "900 12px ui-sans-serif, system-ui, -apple-system, Segoe UI";
      ctx.fillText(`Cycles: ${cycles}/${goalCycles}`, 780, 152);

      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      canvas.removeEventListener("click", click);
    };
  }, [gameOver, goalCycles]);

  async function endGame() {
    if (gameOver) return;
    setGameOver(true);
    await submitScore({ score: Math.max(0, score), timeSpent: 75 - timeLeft });
  }

  return (
    <CanvasGameShell
      title="Water Cycle Lab"
      titleIcon={Droplet}
      titleIconClassName="text-sky-600"
      score={Math.max(0, score)}
      timeLeft={timeLeft}
      backgroundClassName="bg-sky-50"
      headerBorderClassName="border-sky-200"
      canvasCardBorderClassName="border-sky-200"
      canvasBackgroundClassName="bg-white"
      canvasRef={canvasRef}
      onBack={() => navigate("/mini-games")}
      onEndGame={endGame}
      gameOver={gameOver}
      endButtonLabel={gameOver ? "Finished" : "End Game"}
      modalProps={{
        xpEarned: submitResult?.xpEarned || 0,
        masteryData: submitResult?.mastery || null,
        capInfo: submitResult?.capInfo || null,
        ecoImpact: { type: "water", value: 1.0, label: "Water-cycle understanding improved" },
        onClose: () => navigate("/mini-games"),
        onPlayAgain: () => window.location.reload(),
      }}
      debugPanel={
        <>
          {toast ? (
            <div className="mt-3 rounded-xl border border-sky-200 bg-sky-50 p-3 text-sm font-semibold text-sky-800">
              <span className="inline-flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                {toast.text}
              </span>
            </div>
          ) : null}
          <MiniGameDebugPanel gameId="water-cycle-lab" level={level} run={run} submitting={submitting} submitResult={submitResult} />
        </>
      }
    />
  );
}

