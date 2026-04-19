import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy, Star, Flame, TreePine, Droplet, Wind, Trash2,
  ArrowRight, RotateCcw, X, Sparkles, Gamepad2, Brain, Recycle, Zap, Globe, Sprout
} from "lucide-react";
import confetti from "canvas-confetti";
import gamesConfigRaw from "../data/gamesConfig";

const impactIcons = {
  trees: TreePine,
  water: Droplet,
  co2: Wind,
  waste: Trash2
};

const ID_ICON = {
  "eco-memory": Brain, "waste-sorting": Recycle, "trivia-race": Zap,
  "climate-hero": Globe, "plant-growth": Sprout, "ecosystem-builder": Sprout,
  "eco-speed-round": Zap, "eco-habit": Sprout
};

const gamesConfig = gamesConfigRaw.map(g => ({
  ...g,
  Icon: ID_ICON[g.id] || Sprout,
}));

/**
 * GameRewardModal — Shown after a game ends.
 * Props:
 *   xpEarned: number
 *   streakBonus: number (extra XP from streak)
 *   ecoImpact: { type, value, label }
 *   gameId: string
 *   gameName: string
 *   onClose: () => void
 *   onPlayAgain: () => void
 */
export default function GameRewardModal({
  xpEarned = 0,
  streakBonus = 0,
  ecoImpact = null,
  gameName = "Game",
  masteryData = null,
  onClose,
  onPlayAgain,
  show = false
}) {
  const navigate = useNavigate();
  const [celebrated, setCelebrated] = useState(false);

  React.useEffect(() => {
    if (show && !celebrated) {
      setCelebrated(true);
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    }
    if (!show) setCelebrated(false);
  }, [show, celebrated]);

  const ImpactIcon = ecoImpact ? (impactIcons[ecoImpact.type] || Sparkles) : Sparkles;
  const totalXP = xpEarned + streakBonus;

  // ── Poki-style Continuous Loop Logic ───────────────────
  const currentGame = gamesConfig.find(g => g.name === gameName) || gamesConfig[0];
  let recommendations = [];
  if (currentGame.id === "eco-memory" || currentGame.id === "plant-growth") {
    recommendations = gamesConfig.filter(g => g.id === "waste-sorting" || g.id === "eco-habit");
  } else if (currentGame.id === "trivia-race" || currentGame.id === "eco-habit") {
    recommendations = gamesConfig.filter(g => g.id === "climate-hero" || g.id === "waste-sorting");
  } else {
    // Default fallback
    recommendations = gamesConfig.filter(g => g.id !== currentGame.id).slice(0, 2);
  }
  // Fallback to ensuring exactly 2 items
  if (recommendations.length < 2) {
    const extra = gamesConfig.filter(g => g.id !== currentGame.id && !recommendations.find(r => r.id === g.id));
    recommendations = [...recommendations, ...extra].slice(0, 2);
  }

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ scale: 0.85, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden"
          >
            {/* Top gradient banner */}
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 px-6 pt-8 pb-12 text-center relative overflow-hidden">
              <div className="absolute inset-0 opacity-10">
                {[...Array(6)].map((_, i) => (
                  <Star key={i} className="absolute text-white" style={{
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                    width: `${12 + Math.random() * 16}px`,
                    transform: `rotate(${Math.random() * 360}deg)`
                  }} />
                ))}
              </div>

              <motion.div
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-3"
              >
                <Trophy className="w-9 h-9 text-amber-300" />
              </motion.div>
              <h2 className="font-display font-bold text-xl text-white">
                {masteryData?.newUnlockedLevel ? `Level ${masteryData.newUnlockedLevel} Unlocked!` : "Game Complete!"}
              </h2>
              <p className="text-white/70 text-sm mt-1">{gameName}</p>

              {/* Stars Display */}
              {masteryData && (
                <div className="flex justify-center gap-2 mt-4">
                  {[1, 2, 3].map((star) => (
                    <motion.div
                      key={star}
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: masteryData.starsEarned >= star ? 1.2 : 1, rotate: 0 }}
                      transition={{ delay: 0.3 + (star * 0.1), type: "spring" }}
                    >
                      <Star
                        className={`w-8 h-8 ${
                          masteryData.starsEarned >= star
                            ? "text-amber-300 fill-amber-300 drop-shadow-[0_0_8px_rgba(252,211,77,0.8)]"
                            : "text-white/30 fill-transparent"
                        }`}
                      />
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* XP Section */}
            <div className="px-6 -mt-6 relative z-10">
              <div className="bg-white rounded-2xl border border-slate-100 shadow-lg p-5">
                {/* Total XP */}
                <div className="text-center mb-4">
                  <motion.div
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    transition={{ type: "spring", delay: 0.4 }}
                    className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 px-4 py-2 rounded-xl"
                  >
                    <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                    <span className="font-display font-black text-2xl text-amber-700">+{totalXP}</span>
                    <span className="text-amber-600 font-bold text-sm">XP</span>
                  </motion.div>
                </div>

                {/* Breakdown */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-indigo-400" /> Game Score
                    </span>
                    <span className="font-bold text-slate-700">+{xpEarned} XP</span>
                  </div>

                  {streakBonus > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500 flex items-center gap-2">
                        <Flame className="w-4 h-4 text-orange-400" /> Streak Bonus
                      </span>
                      <span className="font-bold text-orange-600">+{streakBonus} XP</span>
                    </div>
                  )}

                  {ecoImpact && (
                    <>
                      <div className="border-t border-slate-100 my-2" />
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500 flex items-center gap-2">
                          <ImpactIcon className="w-4 h-4 text-emerald-500" /> Eco Impact
                        </span>
                        <span className="font-bold text-emerald-600">{ecoImpact.label}</span>
                      </div>
                    </>
                  )}

                  {/* High Score / Mastery feedback */}
                  {masteryData && (
                    <>
                      <div className="border-t border-slate-100 my-2" />
                      
                      {masteryData.newBest > 0 && (
                        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="text-sm font-bold text-indigo-600 flex items-center justify-center bg-indigo-50 py-1.5 rounded-lg mb-2">
                          🎉 New best: {xpEarned} (+{masteryData.newBest})
                        </motion.div>
                      )}

                      {masteryData.nextStarDelta > 0 && masteryData.nextStarDelta < 50 && masteryData.starsEarned > 0 && (
                        <div className="text-xs text-center text-slate-500 font-medium">
                          You needed <span className="text-amber-600 font-bold">{masteryData.nextStarDelta}</span> more points for {masteryData.starsEarned + 1} stars!
                        </div>
                      )}
                      
                      {masteryData.starsEarned === 3 && (
                        <div className="text-xs text-center text-emerald-600 font-bold">
                          Mastery Achieved! ⭐⭐⭐
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Actions: Continuation Loop Hook */}
            <div className="px-6 pb-6 pt-4 flex gap-3">
              <motion.button
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={onPlayAgain}
                className={`flex-1 py-3 rounded-xl border-2 border-slate-200 text-slate-700 font-bold text-sm inline-flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors`}
              >
                <RotateCcw className="w-4 h-4" /> 
                {masteryData?.starsEarned === 3 ? "Play Again" : "Improve Score"}
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={onClose}
                className={`flex-1 py-3 rounded-xl font-bold text-sm inline-flex items-center justify-center gap-2 transition-colors ${
                  masteryData?.newUnlockedLevel 
                    ? "bg-emerald-600 text-white hover:bg-emerald-700" 
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {masteryData?.newUnlockedLevel ? "Try Next Level →" : "Back to Games"}
              </motion.button>
            </div>

            {/* Poki-style Top Picks */}
            <div className="px-6 pb-6 pt-2 border-t border-slate-100">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Try Next Game</h3>
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none snap-x">
                {recommendations.map((rec) => (
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      if (rec.route) navigate(rec.route);
                    }}
                    key={rec.id}
                    className="shrink-0 w-36 bg-slate-50 border border-slate-100 rounded-xl p-3 snap-start cursor-pointer group"
                  >
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${rec.gradient} flex items-center justify-center mb-2 shadow-sm group-hover:shadow-md transition-all`}>
                      <rec.Icon className="w-5 h-5 text-white" strokeWidth={2.5} />
                    </div>
                    <h4 className="font-bold text-xs text-slate-800 leading-tight mb-1 truncate">{rec.name}</h4>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[10px] font-bold text-amber-600 flex items-center gap-1">
                        <Star className="w-3 h-3 fill-amber-400" /> {rec.xp} XP
                      </span>
                      <div className="w-5 h-5 rounded-md bg-emerald-100 flex items-center justify-center">
                        <ArrowRight className="w-3 h-3 text-emerald-600" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
