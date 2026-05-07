import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Route, Leaf, Sparkles } from "lucide-react";
import CanvasGameShell from "../components/CanvasGameShell";
import useMiniGameRun from "../hooks/useMiniGameRun";
import MiniGameDebugPanel from "../components/game/MiniGameDebugPanel";

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

// CO₂ values are illustrative for learning, not strict accounting.
const STEPS = [
  {
    title: "School commute",
    prompt: "How will you travel today?",
    options: [
      { label: "Walk / Cycle", delta: +18, fact: "Active travel reduces emissions and improves health." },
      { label: "Bus", delta: +10, fact: "Public transport shares emissions across many people." },
      { label: "Car (solo)", delta: -10, fact: "Solo car rides usually have higher CO₂ per person." },
    ],
  },
  {
    title: "Water use",
    prompt: "It’s shower time. What do you choose?",
    options: [
      { label: "5-minute shower", delta: +16, fact: "Short showers save water and heating energy." },
      { label: "Bucket bath", delta: +12, fact: "Using a bucket can reduce water use significantly." },
      { label: "Long hot shower", delta: -12, fact: "Long hot showers use more water and energy." },
    ],
  },
  {
    title: "Lunch choice",
    prompt: "Pick a lunch option.",
    options: [
      { label: "Seasonal local food", delta: +14, fact: "Local seasonal food often needs less transport and storage." },
      { label: "Packed at home", delta: +10, fact: "Home packing can reduce single-use packaging." },
      { label: "Single-use packaged snack", delta: -10, fact: "Single-use packaging increases waste and emissions." },
    ],
  },
  {
    title: "Electricity",
    prompt: "Leaving the room for a while.",
    options: [
      { label: "Turn off lights + fan", delta: +14, fact: "Switching off saves energy immediately." },
      { label: "Leave fan on", delta: -4, fact: "Fans use less than AC, but still draw power." },
      { label: "Turn AC lower", delta: -12, fact: "Lower AC temperatures need much more energy." },
    ],
  },
  {
    title: "Waste",
    prompt: "You finish a drink. Where does it go?",
    options: [
      { label: "Rinse + recycle", delta: +12, fact: "Recycling saves energy compared to making new materials." },
      { label: "Compost (if organic)", delta: +10, fact: "Organic waste can be composted instead of landfill." },
      { label: "Throw in trash", delta: -10, fact: "Landfill waste can create methane and pollution." },
    ],
  },
  {
    title: "Evening",
    prompt: "What’s your evening plan?",
    options: [
      { label: "Study + LED light", delta: +10, fact: "LEDs use far less power than incandescent bulbs." },
      { label: "Charge phone, then unplug", delta: +10, fact: "Unplugging reduces phantom power use." },
      { label: "Leave chargers plugged in", delta: -8, fact: "Standby draw adds up across a home." },
    ],
  },
];

export default function CarbonChoices() {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(70);
  const [gameOver, setGameOver] = useState(false);
  const [step, setStep] = useState(0);
  const [toast, setToast] = useState(null);

  const searchParams = new URLSearchParams(window.location.search);
  const level = parseInt(searchParams.get("level"), 10) || 1;
  const { run, submitting, submitResult, submitScore } = useMiniGameRun({ gameId: "carbon-choices", level });

  const steps = useMemo(() => {
    const base = [...STEPS];
    if (level >= 2) base.push({
      title: "Community",
      prompt: "You see litter in the playground.",
      options: [
        { label: "Pick up + sort it", delta: +16, fact: "Small actions add up and influence others." },
        { label: "Tell a friend", delta: +8, fact: "Social norms help make habits stick." },
        { label: "Ignore it", delta: -10, fact: "Litter harms animals and spreads microplastics." },
      ],
    });
    return base;
  }, [level]);

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

    const layoutButtons = (count) => {
      const btns = [];
      const w = 270;
      const h = 58;
      const gap = 14;
      const totalH = count * h + (count - 1) * gap;
      const startY = height * 0.50 - totalH / 2;
      for (let i = 0; i < count; i += 1) {
        btns.push({
          x: width * 0.52,
          y: startY + i * (h + gap),
          w,
          h,
          i,
        });
      }
      return btns;
    };

    let btnRects = layoutButtons(steps[step]?.options?.length || 3);

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
      const rect = btnRects.find((r) => hit(mx, my, r));
      if (!rect) return;
      const opt = steps[step]?.options?.[rect.i];
      if (!opt) return;
      setScore((s) => clamp(s + opt.delta, 0, 99999));
      setToast({ ok: opt.delta >= 0, text: opt.fact });
      window.setTimeout(() => setToast(null), 1600);
      setStep((st) => {
        const next = st + 1;
        if (next >= steps.length) {
          window.setTimeout(() => endGame(), 250);
          return st;
        }
        return next;
      });
    };

    canvas.addEventListener("click", click);

    const drawRounded = (x, y, w, h, r) => {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
    };

    const loop = () => {
      tick += 1;
      btnRects = layoutButtons(steps[step]?.options?.length || 3);
      ctx.clearRect(0, 0, width, height);

      const bg = ctx.createLinearGradient(0, 0, 0, height);
      bg.addColorStop(0, "#ecfdf5");
      bg.addColorStop(0.55, "#eff6ff");
      bg.addColorStop(1, "#fefce8");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, width, height);

      // left panel story
      ctx.fillStyle = "#0f172a";
      ctx.font = "bold 18px ui-sans-serif, system-ui, -apple-system, Segoe UI";
      ctx.fillText("Carbon Choices", 22, 36);

      const s = steps[step] || steps[steps.length - 1];
      ctx.fillStyle = "rgba(15,23,42,0.75)";
      ctx.font = "800 12px ui-sans-serif, system-ui, -apple-system, Segoe UI";
      ctx.fillText(`${s.title.toUpperCase()} • STEP ${Math.min(step + 1, steps.length)}/${steps.length}`, 22, 64);

      ctx.fillStyle = "#111827";
      ctx.font = "bold 18px ui-sans-serif, system-ui, -apple-system, Segoe UI";
      const words = String(s.prompt || "").split(" ");
      let line = "";
      let y = 102;
      for (const w of words) {
        const test = line ? `${line} ${w}` : w;
        if (ctx.measureText(test).width > 420) {
          ctx.fillText(line, 22, y);
          line = w;
          y += 22;
        } else {
          line = test;
        }
      }
      if (line) ctx.fillText(line, 22, y);

      // score widget
      ctx.fillStyle = "rgba(255,255,255,0.86)";
      ctx.strokeStyle = "rgba(15,23,42,0.12)";
      ctx.lineWidth = 2;
      drawRounded(22, 156, 420, 72, 18);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#0f172a";
      ctx.font = "800 12px ui-sans-serif, system-ui, -apple-system, Segoe UI";
      ctx.fillText("CO₂ SMART SCORE", 44, 184);
      ctx.fillStyle = "#047857";
      ctx.font = "900 24px ui-sans-serif, system-ui, -apple-system, Segoe UI";
      ctx.fillText(String(score), 44, 212);
      ctx.fillStyle = "rgba(15,23,42,0.55)";
      ctx.font = "700 12px ui-sans-serif, system-ui, -apple-system, Segoe UI";
      ctx.fillText("Higher is better (choices reduce emissions)", 130, 210);

      // option cards
      const opts = s.options || [];
      opts.forEach((o, i) => {
        const r = btnRects[i];
        const good = o.delta >= 0;
        ctx.fillStyle = "rgba(255,255,255,0.9)";
        ctx.strokeStyle = good ? "rgba(16,185,129,0.55)" : "rgba(244,63,94,0.55)";
        ctx.lineWidth = 2;
        drawRounded(r.x, r.y, r.w, r.h, 16);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = good ? "#047857" : "#be123c";
        ctx.font = "900 12px ui-sans-serif, system-ui, -apple-system, Segoe UI";
        ctx.fillText(`${good ? "+" : ""}${o.delta}`, r.x + 16, r.y + 22);

        ctx.fillStyle = "#0f172a";
        ctx.font = "bold 14px ui-sans-serif, system-ui, -apple-system, Segoe UI";
        ctx.fillText(o.label, r.x + 64, r.y + 24);

        ctx.fillStyle = "rgba(15,23,42,0.55)";
        ctx.font = "700 12px ui-sans-serif, system-ui, -apple-system, Segoe UI";
        ctx.fillText("Tap to choose", r.x + 64, r.y + 44);
      });

      // ambient leaf icon
      ctx.globalAlpha = 0.08;
      ctx.fillStyle = "#0f172a";
      ctx.beginPath();
      ctx.ellipse(width - 120, 110, 90, 60, Math.sin(tick * 0.01) * 0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;

      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      canvas.removeEventListener("click", click);
    };
  }, [gameOver, score, step, steps]);

  async function endGame() {
    if (gameOver) return;
    setGameOver(true);
    await submitScore({ score: Math.max(0, score), timeSpent: 70 - timeLeft });
  }

  return (
    <CanvasGameShell
      title="Carbon Choices"
      titleIcon={Route}
      titleIconClassName="text-emerald-600"
      score={Math.max(0, score)}
      timeLeft={timeLeft}
      backgroundClassName="bg-emerald-50"
      headerBorderClassName="border-emerald-200"
      canvasCardBorderClassName="border-emerald-200"
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
        ecoImpact: { type: "co2", value: 1.2, label: "Low‑carbon decision making practiced" },
        onClose: () => navigate("/mini-games"),
        onPlayAgain: () => window.location.reload(),
      }}
      debugPanel={
        <>
          {toast ? (
            <div
              className={`mt-3 rounded-xl border p-3 text-sm font-semibold ${
                toast.ok ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-rose-200 bg-rose-50 text-rose-800"
              }`}
            >
              <span className="inline-flex items-center gap-2">
                {toast.ok ? <Leaf className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                {toast.text}
              </span>
            </div>
          ) : null}
          <MiniGameDebugPanel gameId="carbon-choices" level={level} run={run} submitting={submitting} submitResult={submitResult} />
        </>
      }
    />
  );
}

