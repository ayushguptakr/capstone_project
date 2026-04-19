import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trees, TreeDeciduous, Leaf, Sprout, ShieldAlert } from "lucide-react";

const STAGE_MAP = {
  seed:    { Icon: Sprout, label: "Planted Seed" },
  sprout:  { Icon: Leaf, label: "Fresh Sprout" },
  growing: { Icon: TreeDeciduous, label: "Growing Plant" },
  tree:    { Icon: Trees, label: "Thriving Tree" },
};

/**
 * EcoPlant — Emotional Feedback Layer ONLY.
 * Receives ALL state from parent. Computes nothing internally.
 */
export default function EcoPlant({ plantStage = "seed", streakAtRisk = false, streak = 0, xp = 0 }) {
  const [timeLeft, setTimeLeft] = useState("");
  const isBroken = streak === 0;

  // Countdown timer for at-risk state
  useEffect(() => {
    if (!streakAtRisk) return;
    const updateTime = () => {
      const now = new Date();
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
      const diffMs = endOfDay - now;
      if (diffMs <= 0) {
         setTimeLeft("Expired");
         return;
      }
      const h = Math.floor(diffMs / (1000 * 60 * 60));
      const m = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      setTimeLeft(`${h}h ${m}m`);
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, [streakAtRisk]);

  // Growth animation — trigger ONLY on stage change
  const [prevStageId, setPrevStageId] = useState(plantStage);
  const [prevXp, setPrevXp] = useState(xp);
  const [animatePhase, setAnimatePhase] = useState("idle");
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (plantStage !== prevStageId || xp > prevXp) {
      setAnimatePhase(xp > prevXp && plantStage === prevStageId ? "bounce" : "growing");
      setPrevStageId(plantStage);
      setPrevXp(xp);
      const t = setTimeout(() => setAnimatePhase("idle"), 1500);
      return () => clearTimeout(t);
    }
  }, [plantStage, prevStageId, xp, prevXp]);

  const stage = STAGE_MAP[plantStage] || STAGE_MAP.seed;
  const Icon = stage.Icon;

  // Visual degradation
  let bgClass = "bg-green-50";
  let iconClass = "text-green-600";
  if (isBroken) {
    bgClass = "bg-slate-100 grayscale opacity-80 border-2 border-slate-200";
    iconClass = "text-slate-400";
  } else if (streakAtRisk) {
    bgClass = "bg-amber-50/70 shadow-[inset_0_0_20px_rgba(245,158,11,0.1)] border-2 border-amber-200";
    iconClass = "text-amber-500 opacity-90";
  }

  return (
    <div className="flex flex-col items-center justify-center p-4 relative group">
      {/* Risk Warning Banner */}
      <AnimatePresence>
        {streakAtRisk && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute -top-7 whitespace-nowrap bg-red-50 text-red-700 px-3 py-1.5 rounded-full border border-red-200 shadow-md flex items-center gap-1.5 z-30 pointer-events-none"
          >
            <ShieldAlert className="w-4 h-4 text-red-500" />
            <span className="text-xs font-bold font-display uppercase tracking-wider">Streak ends in: {timeLeft}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative flex flex-col items-center justify-center pt-2">
        <motion.div
           whileHover={isBroken ? {} : { rotate: [0, -3, 3, 0], scale: 1.05 }}
           animate={
             animatePhase === "growing" 
               ? { scale: [1, 1.3, 1], y: [0, -10, 0] }
               : animatePhase === "bounce"
               ? { scale: [1, 1.15, 1], y: [0, -15, 0] }
               : streakAtRisk 
                   ? { scale: [1, 1.01, 1], rotate: [0, 2, -2, 0] }
                   : isBroken
                       ? { y: 4, scale: 0.95 }
                       : { scale: [1, 1.04, 1], rotate: [0, 1, -1, 0] }
           }
           transition={
             animatePhase === "growing" || animatePhase === "bounce"
               ? { duration: 0.6, ease: "easeOut" } 
               : streakAtRisk
                   ? { repeat: Infinity, duration: 4, ease: "easeInOut" }
                   : isBroken
                       ? { duration: 0 }
                       : { repeat: Infinity, duration: 4.5, ease: "easeInOut" }
           }
           className={`w-32 h-32 rounded-full flex items-center justify-center z-10 transition-colors duration-700 cursor-pointer ${bgClass}`}
        >
          <Icon className={`w-16 h-16 transition-all duration-700 ${iconClass}`} strokeWidth={1.5} />
        </motion.div>
        
        {/* Pot / Soil */}
        <div className="w-24 h-5 bg-[#8D6E63] rounded-b-xl -mt-3 shadow-md z-0" />
        <div className="w-28 h-2 bg-[#795548] rounded-full -mt-6 z-20 opacity-80 mix-blend-multiply" />
      </div>

      <div className="mt-4 text-center select-none pt-2">
        <p className={`font-display font-bold ${streakAtRisk ? 'text-amber-800' : isBroken ? 'text-slate-500' : 'text-[#2D332F]'}`}>
          {isBroken ? "Wilted Seed" : stage.label}
        </p>
        <p className={`text-xs font-semibold mt-0.5 max-w-[150px] leading-tight ${streakAtRisk ? 'text-red-500' : 'text-gray-500'}`}>
          {streakAtRisk ? "Your streak needs attention today" : isBroken ? "Start a new streak to revive." : "You're building a strong eco habit 🌱"}
        </p>
      </div>
    </div>
  );
}
