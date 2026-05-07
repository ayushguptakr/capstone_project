import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bolt, PlugZap, Info } from "lucide-react";
import CanvasGameShell from "../components/CanvasGameShell";
import useMiniGameRun from "../hooks/useMiniGameRun";
import MiniGameDebugPanel from "../components/game/MiniGameDebugPanel";

const DEVICES = [
  { name: "Air Conditioner", watts: 1200, tip: "AC can use 1000W+; set 24–26°C to save energy." },
  { name: "Electric Kettle", watts: 1500, tip: "Boil only what you need; kettles are high-power." },
  { name: "Microwave", watts: 1100, tip: "Microwaves are efficient for small portions." },
  { name: "Iron", watts: 1000, tip: "Iron in batches to reduce repeated heat-up cycles." },
  { name: "Hair Dryer", watts: 1600, tip: "High heat draws lots of power; use lower heat when possible." },
  { name: "Desktop PC", watts: 300, tip: "Enable sleep mode to reduce standby usage." },
  { name: "Ceiling Fan", watts: 70, tip: "Fans use far less power than AC." },
  { name: "LED Bulb", watts: 10, tip: "LED bulbs save energy compared to incandescent." },
  { name: "Phone Charger", watts: 5, tip: "Unplug chargers when not in use to cut phantom load." },
  { name: "TV (LED)", watts: 120, tip: "Lower brightness and turn off when not watching." },
];

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

export default function PowerPlanner() {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(55);
  const [gameOver, setGameOver] = useState(false);
  const [banner, setBanner] = useState(null); // { ok, text }

  const searchParams = new URLSearchParams(window.location.search);
  const level = parseInt(searchParams.get("level"), 10) || 1;
  const { run, submitting, submitResult, submitScore } = useMiniGameRun({ gameId: "power-planner", level });

  const targetWatts = useMemo(() => (level >= 3 ? 250 : level === 2 ? 300 : 350), [level]);

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

    const tiles = [];
    const particles = [];
    const spawn = () => {
      const d = DEVICES[Math.floor(Math.random() * DEVICES.length)];
      tiles.push({
        id: `${tick}-${Math.random()}`,
        d,
        x: 70 + Math.random() * (width - 140),
        y: height + 40,
        w: 220,
        h: 64,
        vy: 2.2 + level * 0.55 + Math.random() * 0.9,
        wobble: Math.random() * Math.PI * 2,
      });
    };

    const burst = (x, y, ok) => {
      for (let i = 0; i < 16; i += 1) {
        particles.push({
          x,
          y,
          vx: (Math.random() - 0.5) * (ok ? 7 : 5),
          vy: (Math.random() - 0.8) * (ok ? 7 : 5),
          life: 22 + Math.random() * 14,
          ok,
        });
      }
    };

    const click = (e) => {
      const rect = canvas.getBoundingClientRect();
      const mx = ((e.clientX - rect.left) / rect.width) * width;
      const my = ((e.clientY - rect.top) / rect.height) * height;
      for (let i = tiles.length - 1; i >= 0; i -= 1) {
        const t = tiles[i];
        if (mx >= t.x && mx <= t.x + t.w && my >= t.y && my <= t.y + t.h) {
          const ok = Number(t.d.watts) >= targetWatts;
          burst(mx, my, ok);
          setScore((s) => clamp(s + (ok ? 14 : -8), 0, 99999));
          setBanner({
            ok,
            text: ok ? t.d.tip : `Not a big energy user. Focus on ${targetWatts}W+ devices.`,
          });
          window.setTimeout(() => setBanner(null), 1400);
          tiles.splice(i, 1);
          break;
        }
      }
    };

    canvas.addEventListener("click", click);

    const loop = () => {
      tick += 1;
      ctx.clearRect(0, 0, width, height);

      // background
      const bg = ctx.createLinearGradient(0, 0, 0, height);
      bg.addColorStop(0, "#0b1220");
      bg.addColorStop(0.55, "#0f172a");
      bg.addColorStop(1, "#06281e");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, width, height);

      // glow lines
      ctx.globalAlpha = 0.12;
      ctx.strokeStyle = "#22c55e";
      for (let y = 70; y < height; y += 54) {
        ctx.beginPath();
        ctx.moveTo(0, y + Math.sin((tick + y) * 0.02) * 6);
        ctx.lineTo(width, y + Math.sin((tick + y) * 0.02) * 6);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;

      // prompt
      ctx.fillStyle = "rgba(255,255,255,0.9)";
      ctx.font = "bold 18px ui-sans-serif, system-ui, -apple-system, Segoe UI";
      ctx.fillText(`Tap devices that use ${targetWatts}W or more`, 22, 34);
      ctx.font = "600 12px ui-sans-serif, system-ui, -apple-system, Segoe UI";
      ctx.fillStyle = "rgba(226,232,240,0.78)";
      ctx.fillText("High-power devices matter most for saving energy.", 22, 54);

      if (tick % Math.max(20, 42 - level * 7) === 0) spawn();

      // tiles
      for (let i = tiles.length - 1; i >= 0; i -= 1) {
        const t = tiles[i];
        t.y -= t.vy;
        t.x += Math.sin((tick * 0.03) + t.wobble) * 0.25;

        const isHigh = Number(t.d.watts) >= targetWatts;
        ctx.fillStyle = "rgba(255,255,255,0.92)";
        ctx.strokeStyle = isHigh ? "rgba(245,158,11,0.75)" : "rgba(148,163,184,0.35)";
        ctx.lineWidth = 2;

        // card
        const r = 14;
        ctx.beginPath();
        ctx.moveTo(t.x + r, t.y);
        ctx.arcTo(t.x + t.w, t.y, t.x + t.w, t.y + t.h, r);
        ctx.arcTo(t.x + t.w, t.y + t.h, t.x, t.y + t.h, r);
        ctx.arcTo(t.x, t.y + t.h, t.x, t.y, r);
        ctx.arcTo(t.x, t.y, t.x + t.w, t.y, r);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // inner stripe
        ctx.fillStyle = isHigh ? "rgba(245,158,11,0.16)" : "rgba(16,185,129,0.12)";
        ctx.fillRect(t.x, t.y, t.w, 10);

        // text
        ctx.fillStyle = "#0f172a";
        ctx.font = "bold 14px ui-sans-serif, system-ui, -apple-system, Segoe UI";
        ctx.fillText(t.d.name, t.x + 14, t.y + 34);
        ctx.font = "800 12px ui-sans-serif, system-ui, -apple-system, Segoe UI";
        ctx.fillStyle = isHigh ? "#b45309" : "#047857";
        ctx.fillText(`${t.d.watts}W`, t.x + t.w - 56, t.y + 34);

        if (t.y + t.h < -20) tiles.splice(i, 1);
      }

      // particles
      for (let i = particles.length - 1; i >= 0; i -= 1) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.22;
        p.life -= 1;
        ctx.globalAlpha = clamp(p.life / 36, 0, 1);
        ctx.fillStyle = p.ok ? "#22c55e" : "#ef4444";
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3.1, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
        if (p.life <= 0) particles.splice(i, 1);
      }

      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      canvas.removeEventListener("click", click);
    };
  }, [gameOver, level, targetWatts]);

  async function endGame() {
    if (gameOver) return;
    setGameOver(true);
    await submitScore({ score: Math.max(0, score), timeSpent: 55 - timeLeft });
  }

  return (
    <CanvasGameShell
      title="Power Planner"
      titleIcon={Bolt}
      titleIconClassName="text-emerald-600"
      score={Math.max(0, score)}
      timeLeft={timeLeft}
      backgroundClassName="bg-slate-950"
      headerBorderClassName="border-slate-800"
      canvasCardBorderClassName="border-slate-800"
      canvasBackgroundClassName="bg-slate-900"
      canvasRef={canvasRef}
      onBack={() => navigate("/mini-games")}
      onEndGame={endGame}
      gameOver={gameOver}
      endButtonLabel={gameOver ? "Finished" : "End Game"}
      modalProps={{
        xpEarned: submitResult?.xpEarned || 0,
        masteryData: submitResult?.mastery || null,
        capInfo: submitResult?.capInfo || null,
        ecoImpact: { type: "energy", value: 1.4, label: "1.4 kWh energy awareness" },
        onClose: () => navigate("/mini-games"),
        onPlayAgain: () => window.location.reload(),
      }}
      debugPanel={
        <>
          {banner ? (
            <div
              className={`mt-3 rounded-xl border p-3 text-sm font-semibold ${
                banner.ok ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-rose-200 bg-rose-50 text-rose-800"
              }`}
            >
              <span className="inline-flex items-start gap-2">
                {banner.ok ? <PlugZap className="w-4 h-4 mt-0.5" /> : <Info className="w-4 h-4 mt-0.5" />}
                <span>{banner.text}</span>
              </span>
            </div>
          ) : null}
          <MiniGameDebugPanel gameId="power-planner" level={level} run={run} submitting={submitting} submitResult={submitResult} />
        </>
      }
    />
  );
}

