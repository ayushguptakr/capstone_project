import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layers, Sparkles } from "lucide-react";
import CanvasGameShell from "../components/CanvasGameShell";
import useMiniGameRun from "../hooks/useMiniGameRun";
import MiniGameDebugPanel from "../components/game/MiniGameDebugPanel";

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

const SPECIES = [
  { id: "plant", name: "Plants", role: "producer", color: "#10b981", fact: "Producers create energy from sunlight (photosynthesis)." },
  { id: "rabbit", name: "Rabbit", role: "herbivore", color: "#38bdf8", fact: "Herbivores transfer energy from plants to animals." },
  { id: "fox", name: "Fox", role: "carnivore", color: "#fb7185", fact: "Predators control populations and prevent overgrazing." },
  { id: "hawk", name: "Hawk", role: "carnivore", color: "#f59e0b", fact: "Top predators keep the food web balanced." },
  { id: "fungi", name: "Decomposer", role: "decomposer", color: "#a78bfa", fact: "Decomposers recycle nutrients back into soil." },
];

function scoreWeb(slots) {
  const roles = slots.map((s) => s?.role).filter(Boolean);
  const count = (r) => roles.filter((x) => x === r).length;
  const producers = count("producer");
  const herb = count("herbivore");
  const carn = count("carnivore");
  const decomp = count("decomposer");

  // Balanced heuristic:
  // - must include producer + decomposer
  // - should include at least 1 herbivore
  // - too many carnivores without herbivore hurts
  let score = 0;
  if (producers >= 1) score += 80;
  if (decomp >= 1) score += 80;
  if (herb >= 1) score += 90;
  score += clamp(producers, 0, 2) * 25;
  score += clamp(herb, 0, 2) * 35;
  score += clamp(decomp, 0, 1) * 25;

  if (carn === 0) score += 30;
  if (carn === 1) score += 55;
  if (carn >= 2) score -= 25 * (carn - 1);
  if (carn > 0 && herb === 0) score -= 90;

  return clamp(Math.round(score), 0, 520);
}

export default function EcosystemBalance() {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(70);
  const [gameOver, setGameOver] = useState(false);
  const [tip, setTip] = useState(null);

  const searchParams = new URLSearchParams(window.location.search);
  const level = parseInt(searchParams.get("level"), 10) || 1;
  const { run, submitting, submitResult, submitScore } = useMiniGameRun({ gameId: "ecosystem-balance", level });

  const difficulty = useMemo(() => {
    // more slots on higher levels
    return level >= 3 ? { slots: 5, target: 420 } : level === 2 ? { slots: 4, target: 360 } : { slots: 3, target: 300 };
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

    const deck = SPECIES.map((s, idx) => ({
      ...s,
      x: 30,
      y: 90 + idx * 62,
      w: 240,
      h: 48,
    }));

    const slots = new Array(difficulty.slots).fill(null).map((_, i) => ({
      x: 330 + i * 120,
      y: 300,
      w: 100,
      h: 86,
      item: null,
    }));

    let dragging = null; // { src: "deck"|"slot", index, offsetX, offsetY, item }

    const hitRect = (mx, my, r) => mx >= r.x && mx <= r.x + r.w && my >= r.y && my <= r.y + r.h;
    const getMouse = (e) => {
      const rect = canvas.getBoundingClientRect();
      return {
        x: ((e.clientX - rect.left) / rect.width) * width,
        y: ((e.clientY - rect.top) / rect.height) * height,
      };
    };

    const pickFromSlot = (idx, mx, my) => {
      const s = slots[idx];
      if (!s.item) return null;
      const item = s.item;
      slots[idx].item = null;
      return {
        src: "slot",
        index: idx,
        item,
        offsetX: mx - s.x,
        offsetY: my - s.y,
        x: s.x,
        y: s.y,
        w: s.w,
        h: s.h,
      };
    };

    const down = (e) => {
      const { x: mx, y: my } = getMouse(e);
      // slots first
      for (let i = 0; i < slots.length; i += 1) {
        if (hitRect(mx, my, slots[i])) {
          const d = pickFromSlot(i, mx, my);
          if (d) dragging = d;
          return;
        }
      }
      // deck items (clone)
      for (let i = 0; i < deck.length; i += 1) {
        if (hitRect(mx, my, deck[i])) {
          const base = deck[i];
          dragging = {
            src: "deck",
            index: i,
            item: base,
            offsetX: mx - base.x,
            offsetY: my - base.y,
            x: base.x,
            y: base.y,
            w: base.w,
            h: base.h,
          };
          setTip(base.fact);
          window.setTimeout(() => setTip(null), 1400);
          return;
        }
      }
    };

    const move = (e) => {
      if (!dragging) return;
      const { x: mx, y: my } = getMouse(e);
      dragging.x = mx - dragging.offsetX;
      dragging.y = my - dragging.offsetY;
    };

    const up = (e) => {
      if (!dragging) return;
      const { x: mx, y: my } = getMouse(e);
      // drop into a slot
      for (let i = 0; i < slots.length; i += 1) {
        if (hitRect(mx, my, slots[i])) {
          if (!slots[i].item) {
            slots[i].item = dragging.item;
          }
        }
      }
      dragging = null;
      // recalc score immediately
      const s = scoreWeb(slots.map((x) => x.item));
      setScore(s);
      if (s >= difficulty.target) {
        // quick reward for reaching target early
        setScore((prev) => Math.max(prev, s + 40));
      }
    };

    canvas.addEventListener("mousedown", down);
    canvas.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);

    const drawCard = (r, label, color, subtitle) => {
      const rad = 14;
      ctx.fillStyle = "rgba(255,255,255,0.92)";
      ctx.strokeStyle = "rgba(15,23,42,0.12)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(r.x + rad, r.y);
      ctx.arcTo(r.x + r.w, r.y, r.x + r.w, r.y + r.h, rad);
      ctx.arcTo(r.x + r.w, r.y + r.h, r.x, r.y + r.h, rad);
      ctx.arcTo(r.x, r.y + r.h, r.x, r.y, rad);
      ctx.arcTo(r.x, r.y, r.x + r.w, r.y, rad);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = color;
      ctx.fillRect(r.x, r.y, 10, r.h);

      ctx.fillStyle = "#0f172a";
      ctx.font = "bold 14px ui-sans-serif, system-ui, -apple-system, Segoe UI";
      ctx.fillText(label, r.x + 18, r.y + 22);
      if (subtitle) {
        ctx.fillStyle = "rgba(15,23,42,0.65)";
        ctx.font = "600 12px ui-sans-serif, system-ui, -apple-system, Segoe UI";
        ctx.fillText(subtitle, r.x + 18, r.y + 40);
      }
    };

    const loop = () => {
      tick += 1;
      ctx.clearRect(0, 0, width, height);

      // background
      const bg = ctx.createLinearGradient(0, 0, 0, height);
      bg.addColorStop(0, "#ecfeff");
      bg.addColorStop(0.55, "#ecfdf5");
      bg.addColorStop(1, "#fefce8");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, width, height);

      // header
      ctx.fillStyle = "#0f172a";
      ctx.font = "bold 18px ui-sans-serif, system-ui, -apple-system, Segoe UI";
      ctx.fillText("Build a balanced ecosystem", 22, 36);
      ctx.fillStyle = "rgba(15,23,42,0.65)";
      ctx.font = "600 12px ui-sans-serif, system-ui, -apple-system, Segoe UI";
      ctx.fillText(`Target stability: ${difficulty.target}+`, 22, 56);

      // deck panel
      ctx.fillStyle = "rgba(15,23,42,0.06)";
      ctx.fillRect(18, 74, 270, 360);
      ctx.fillStyle = "rgba(15,23,42,0.55)";
      ctx.font = "800 12px ui-sans-serif, system-ui, -apple-system, Segoe UI";
      ctx.fillText("Species deck (drag into slots)", 30, 92);

      deck.forEach((d) => drawCard(d, d.name, d.color, d.role));

      // slots
      ctx.fillStyle = "rgba(15,23,42,0.06)";
      ctx.fillRect(310, 240, 590, 210);
      ctx.fillStyle = "rgba(15,23,42,0.55)";
      ctx.font = "800 12px ui-sans-serif, system-ui, -apple-system, Segoe UI";
      ctx.fillText("Food web slots", 330, 262);

      slots.forEach((s) => {
        const r = { x: s.x, y: s.y, w: s.w, h: s.h };
        ctx.fillStyle = "rgba(255,255,255,0.78)";
        ctx.strokeStyle = "rgba(15,23,42,0.12)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(r.x, r.y, r.w, r.h, 16);
        ctx.fill();
        ctx.stroke();

        if (s.item) {
          drawCard(
            { x: r.x + 6, y: r.y + 8, w: r.w - 12, h: r.h - 16 },
            s.item.name,
            s.item.color,
            s.item.role
          );
        } else {
          ctx.fillStyle = "rgba(15,23,42,0.35)";
          ctx.font = "700 12px ui-sans-serif, system-ui, -apple-system, Segoe UI";
          ctx.fillText("Drop", r.x + 32, r.y + 48);
        }
      });

      // stability meter
      const sNow = scoreWeb(slots.map((x) => x.item));
      const pct = clamp(Math.round((sNow / Math.max(1, difficulty.target)) * 100), 0, 100);
      ctx.fillStyle = "rgba(255,255,255,0.85)";
      ctx.strokeStyle = "rgba(15,23,42,0.12)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(330, 90, 560, 64, 18);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#0f172a";
      ctx.font = "bold 14px ui-sans-serif, system-ui, -apple-system, Segoe UI";
      ctx.fillText(`Stability: ${sNow}`, 350, 120);
      ctx.fillStyle = "rgba(15,23,42,0.55)";
      ctx.font = "700 12px ui-sans-serif, system-ui, -apple-system, Segoe UI";
      ctx.fillText("Aim for producers + herbivore + decomposer", 350, 140);

      ctx.fillStyle = "rgba(15,23,42,0.08)";
      ctx.beginPath();
      ctx.roundRect(530, 112, 330, 10, 999);
      ctx.fill();
      ctx.fillStyle = "rgba(16,185,129,0.92)";
      ctx.beginPath();
      ctx.roundRect(530, 112, Math.max(8, (330 * pct) / 100), 10, 999);
      ctx.fill();

      // dragging on top
      if (dragging) {
        drawCard(
          { x: dragging.x, y: dragging.y, w: dragging.w, h: dragging.h },
          dragging.item.name,
          dragging.item.color,
          dragging.item.role
        );
      }

      // floating hint
      if (tick % 240 < 6) {
        ctx.fillStyle = "rgba(15,23,42,0.55)";
        ctx.font = "600 12px ui-sans-serif, system-ui, -apple-system, Segoe UI";
        ctx.fillText("Tip: Too many predators without herbivores destabilizes the web.", 330, 205);
      }

      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      canvas.removeEventListener("mousedown", down);
      canvas.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    };
  }, [difficulty.slots, difficulty.target, gameOver]);

  async function endGame() {
    if (gameOver) return;
    setGameOver(true);
    await submitScore({ score: Math.max(0, score), timeSpent: 70 - timeLeft });
  }

  return (
    <CanvasGameShell
      title="Ecosystem Balance"
      titleIcon={Layers}
      titleIconClassName="text-teal-600"
      score={Math.max(0, score)}
      timeLeft={timeLeft}
      backgroundClassName="bg-teal-50"
      headerBorderClassName="border-teal-200"
      canvasCardBorderClassName="border-teal-200"
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
        ecoImpact: { type: "trees", value: 0.8, label: "Food-web awareness increased" },
        onClose: () => navigate("/mini-games"),
        onPlayAgain: () => window.location.reload(),
      }}
      debugPanel={
        <>
          {tip ? (
            <div className="mt-3 rounded-xl border border-teal-200 bg-teal-50 p-3 text-sm font-semibold text-teal-800">
              <span className="inline-flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                {tip}
              </span>
            </div>
          ) : null}
          <MiniGameDebugPanel gameId="ecosystem-balance" level={level} run={run} submitting={submitting} submitResult={submitResult} />
        </>
      }
    />
  );
}

