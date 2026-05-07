import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Crosshair, Sparkles } from "lucide-react";
import CanvasGameShell from "../components/CanvasGameShell";
import useMiniGameRun from "../hooks/useMiniGameRun";
import MiniGameDebugPanel from "../components/game/MiniGameDebugPanel";
import useGameQuestionPool from "../hooks/useGameQuestionPool";

const QUESTIONS = [
  {
    q: "Which action saves the most electricity at home?",
    options: ["Turn off lights", "Unplug chargers", "Run AC at 16°C"],
    correct: 1,
    fact: "Unplugging chargers and standby devices reduces 'phantom' power use.",
  },
  {
    q: "Which transport usually has the lowest CO₂ per person?",
    options: ["Bus", "Single-person car", "Motorbike"],
    correct: 0,
    fact: "Public transport shares emissions across many people.",
  },
  {
    q: "What should go in the compost bin?",
    options: ["Banana peel", "Plastic wrapper", "Glass bottle"],
    correct: 0,
    fact: "Food scraps can become compost instead of landfill methane.",
  },
  {
    q: "Best way to save water while brushing teeth?",
    options: ["Keep tap running", "Use warm water", "Turn tap off"],
    correct: 2,
    fact: "Turning off the tap can save many liters per day.",
  },
  {
    q: "Which is a renewable energy source?",
    options: ["Coal", "Wind", "Diesel"],
    correct: 1,
    fact: "Wind energy is renewable because wind is naturally replenished.",
  },
];

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

export default function EcoQuizBlaster() {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameOver, setGameOver] = useState(false);
  const [feedback, setFeedback] = useState(null); // { ok, text }

  const searchParams = new URLSearchParams(window.location.search);
  const level = parseInt(searchParams.get("level"), 10) || 1;
  const { run, submitting, submitResult, submitScore } = useMiniGameRun({ gameId: "eco-quiz-blaster", level });

  const fallbackPool = useMemo(
    () =>
      QUESTIONS.map((q, idx) => ({
        id: `blaster-fb-${idx}`,
        question: q.q,
        options: q.options,
        answerIndex: q.correct,
        fact: q.fact,
      })),
    []
  );
  const { nextQuestion: getNextQuestion } = useGameQuestionPool({
    topic: "energy, water, waste, climate",
    level,
    desiredCount: 18,
    fallback: fallbackPool,
  });
  const [current, setCurrent] = useState(() => getNextQuestion() || fallbackPool[0]);

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

    const opts = (current?.options || []).map((label, i) => ({
      i,
      label,
      x: (width / 4) * (i + 1),
      y: height * 0.66,
      r: 44,
      vx: (i === 1 ? 1 : i === 0 ? -1 : 1.2) * (0.8 + level * 0.25),
    }));

    const particles = [];
    const spawnBurst = (x, y, ok) => {
      for (let k = 0; k < 18; k += 1) {
        particles.push({
          x,
          y,
          vx: (Math.random() - 0.5) * (ok ? 7 : 5),
          vy: (Math.random() - 0.8) * (ok ? 7 : 5),
          life: 24 + Math.random() * 10,
          ok,
        });
      }
    };

    const click = (e) => {
      if (gameOver) return;
      const rect = canvas.getBoundingClientRect();
      const mx = ((e.clientX - rect.left) / rect.width) * width;
      const my = ((e.clientY - rect.top) / rect.height) * height;
      const hit = opts.find((o) => Math.hypot(o.x - mx, o.y - my) <= o.r);
      if (!hit) return;

      const ok = hit.i === current?.answerIndex;
      spawnBurst(hit.x, hit.y, ok);
      setFeedback({
        ok,
        text: ok ? (current?.fact || "Nice choice!") : "Not quite. Try the next one!",
      });
      window.setTimeout(() => setFeedback(null), 1200);
      setScore((s) => clamp(s + (ok ? 18 : -8), 0, 99999));
      setCurrent(getNextQuestion() || current);
    };

    canvas.addEventListener("click", click);

    const loop = () => {
      tick += 1;
      ctx.clearRect(0, 0, width, height);

      // background
      const bg = ctx.createLinearGradient(0, 0, 0, height);
      bg.addColorStop(0, "#E0F2FE");
      bg.addColorStop(0.55, "#ECFDF5");
      bg.addColorStop(1, "#FEFCE8");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, width, height);

      // subtle grid
      ctx.globalAlpha = 0.12;
      ctx.strokeStyle = "#0f172a";
      for (let x = 0; x < width; x += 46) {
        ctx.beginPath();
        ctx.moveTo(x + (tick % 46), 0);
        ctx.lineTo(x + (tick % 46), height);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;

      // title + question
      ctx.fillStyle = "#0f172a";
      ctx.font = "bold 20px ui-sans-serif, system-ui, -apple-system, Segoe UI";
      ctx.fillText("Eco Quiz Blaster", 22, 34);
      ctx.font = "bold 18px ui-sans-serif, system-ui, -apple-system, Segoe UI";
      const q = current?.question || "Question";
      const maxW = width - 44;
      const words = String(q).split(" ");
      let line = "";
      let y = 72;
      ctx.fillStyle = "#1f2937";
      for (const w of words) {
        const test = line ? `${line} ${w}` : w;
        if (ctx.measureText(test).width > maxW) {
          ctx.fillText(line, 22, y);
          line = w;
          y += 22;
        } else {
          line = test;
        }
      }
      if (line) ctx.fillText(line, 22, y);

      // moving option bubbles
      for (const o of opts) {
        o.x += o.vx;
        if (o.x < o.r + 16 || o.x > width - o.r - 16) o.vx *= -1;

        // bubble
        const grad = ctx.createRadialGradient(o.x - 10, o.y - 10, 10, o.x, o.y, o.r + 12);
        grad.addColorStop(0, "rgba(255,255,255,0.95)");
        grad.addColorStop(1, "rgba(16,185,129,0.18)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = "rgba(15,23,42,0.12)";
        ctx.lineWidth = 2;
        ctx.stroke();

        // label
        ctx.fillStyle = "#0f172a";
        ctx.font = "bold 13px ui-sans-serif, system-ui, -apple-system, Segoe UI";
        const text = o.label;
        const tw = ctx.measureText(text).width;
        ctx.fillText(text, o.x - tw / 2, o.y + 4);
      }

      // particles
      for (let i = particles.length - 1; i >= 0; i -= 1) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.22;
        p.life -= 1;
        ctx.globalAlpha = clamp(p.life / 34, 0, 1);
        ctx.fillStyle = p.ok ? "#10b981" : "#ef4444";
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
        if (p.life <= 0) particles.splice(i, 1);
      }

      // hint
      ctx.fillStyle = "rgba(15,23,42,0.65)";
      ctx.font = "600 12px ui-sans-serif, system-ui, -apple-system, Segoe UI";
      ctx.fillText("Click the correct bubble. Learn a fact each round.", 22, height - 18);

      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      canvas.removeEventListener("click", click);
    };
  }, [current, gameOver, level, getNextQuestion]);

  async function endGame() {
    if (gameOver) return;
    setGameOver(true);
    await submitScore({ score: Math.max(0, score), timeSpent: 60 - timeLeft });
  }

  return (
    <CanvasGameShell
      title="Eco Quiz Blaster"
      titleIcon={Crosshair}
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
        ecoImpact: { type: "co2", value: 0.6, label: "0.6 kg CO₂ awareness" },
        onClose: () => navigate("/mini-games"),
        onPlayAgain: () => window.location.reload(),
      }}
      debugPanel={
        <>
          {feedback ? (
            <div
              className={`mt-3 rounded-xl border p-3 text-sm font-semibold ${
                feedback.ok ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-rose-200 bg-rose-50 text-rose-800"
              }`}
            >
              <span className="inline-flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                {feedback.text}
              </span>
            </div>
          ) : null}
          <MiniGameDebugPanel gameId="eco-quiz-blaster" level={level} run={run} submitting={submitting} submitResult={submitResult} />
        </>
      }
    />
  );
}

