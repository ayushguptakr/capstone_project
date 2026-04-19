import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Trophy, Star, Flame, Target, Droplet, TreePine, Zap as ZapIcon,
  Trash2, RotateCcw, ArrowRight, TrendingUp
} from "lucide-react";
import confetti from "canvas-confetti";

const impactIcons = {
  energy: ZapIcon,
  water: Droplet,
  co2: TrendingUp,
  waste: Trash2,
  trees: TreePine,
};

/**
 * ResultModal — End-of-game celebration screen.
 */
export default function ResultModal({
  score,
  xpEarned,
  accuracy,
  correctCount,
  totalRounds,
  maxStreak,
  ecoImpacts = [],
  onPlayAgain,
}) {
  const navigate = useNavigate();
  const [animatedScore, setAnimatedScore] = useState(0);
  const [animatedXP, setAnimatedXP] = useState(0);

  // Confetti burst
  useEffect(() => {
    if (accuracy >= 70) {
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.55 } });
    }
  }, [accuracy]);

  // Animated counter
  useEffect(() => {
    const duration = 1200;
    const steps = 40;
    const stepTime = duration / steps;
    let step = 0;
    const iv = setInterval(() => {
      step++;
      setAnimatedScore(Math.round((step / steps) * score));
      setAnimatedXP(Math.round((step / steps) * xpEarned));
      if (step >= steps) clearInterval(iv);
    }, stepTime);
    return () => clearInterval(iv);
  }, [score, xpEarned]);

  // Aggregate eco impacts
  const uniqueImpacts = [];
  const seen = new Set();
  for (const imp of ecoImpacts) {
    if (imp && !seen.has(imp.value)) {
      seen.add(imp.value);
      uniqueImpacts.push(imp);
    }
  }

  const grade = accuracy >= 90 ? "S" : accuracy >= 70 ? "A" : accuracy >= 50 ? "B" : "C";
  const gradeColor = {
    S: "from-amber-400 to-orange-500 text-amber-50",
    A: "from-emerald-400 to-teal-500 text-emerald-50",
    B: "from-sky-400 to-blue-500 text-sky-50",
    C: "from-slate-400 to-slate-500 text-slate-50"
  }[grade];

  const message = accuracy >= 90
    ? "Incredible! You're an eco champion! 🌟"
    : accuracy >= 70
    ? "Great job! You really know your stuff! 🌱"
    : accuracy >= 50
    ? "Good effort! Keep learning and growing! 💪"
    : "Don't worry! Every effort counts. Try again! 🌍";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.1 }}
        className="w-full max-w-md"
      >
        {/* Grade + Score Header */}
        <div className="bg-white rounded-t-3xl border border-b-0 border-slate-200 shadow-[0_-4px_32px_rgba(0,0,0,0.06)] pt-8 pb-6 px-6 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, delay: 0.3 }}
            className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${gradeColor} flex items-center justify-center mx-auto mb-4 shadow-lg`}
          >
            <span className="text-4xl font-black">{grade}</span>
          </motion.div>

          <h1 className="font-display font-bold text-2xl text-slate-800 mb-1">Game Complete!</h1>
          <p className="text-slate-500 text-sm">{message}</p>
        </div>

        {/* Stats Grid */}
        <div className="bg-slate-50 border-x border-slate-200 px-6 py-5">
          <div className="grid grid-cols-2 gap-3">
            {/* Score */}
            <div className="bg-white rounded-xl p-3.5 border border-slate-200 text-center">
              <Trophy className="w-5 h-5 text-amber-500 mx-auto mb-1.5" />
              <motion.p className="font-black text-xl text-slate-800 tabular-nums">
                {animatedScore.toLocaleString()}
              </motion.p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Score</p>
            </div>

            {/* XP */}
            <div className="bg-white rounded-xl p-3.5 border border-slate-200 text-center">
              <Star className="w-5 h-5 text-emerald-500 mx-auto mb-1.5" />
              <motion.p className="font-black text-xl text-emerald-600 tabular-nums">
                +{animatedXP}
              </motion.p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">XP Earned</p>
            </div>

            {/* Accuracy */}
            <div className="bg-white rounded-xl p-3.5 border border-slate-200 text-center">
              <Target className="w-5 h-5 text-indigo-500 mx-auto mb-1.5" />
              <p className="font-black text-xl text-slate-800">{accuracy}%</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {correctCount}/{totalRounds} Correct
              </p>
            </div>

            {/* Max Streak */}
            <div className="bg-white rounded-xl p-3.5 border border-slate-200 text-center">
              <Flame className="w-5 h-5 text-orange-500 mx-auto mb-1.5" />
              <p className="font-black text-xl text-slate-800">x{maxStreak}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Best Streak</p>
            </div>
          </div>
        </div>

        {/* Eco Impact Summary */}
        {uniqueImpacts.length > 0 && (
          <div className="bg-emerald-50 border-x border-slate-200 px-6 py-4">
            <p className="text-[10px] font-bold uppercase text-emerald-600 tracking-wider mb-2.5">🌍 Your Eco Impact</p>
            <div className="space-y-2">
              {uniqueImpacts.slice(0, 4).map((imp, i) => {
                const Icon = impactIcons[imp.type] || Star;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 + i * 0.1 }}
                    className="flex items-center gap-2.5 text-sm"
                  >
                    <div className="w-6 h-6 rounded-lg bg-emerald-100 flex items-center justify-center">
                      <Icon className="w-3.5 h-3.5 text-emerald-600" />
                    </div>
                    <span className="font-semibold text-emerald-800 text-xs">{imp.value}</span>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="bg-white rounded-b-3xl border border-t-0 border-slate-200 shadow-[0_12px_32px_rgba(0,0,0,0.06)] px-6 py-5 flex gap-3">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onPlayAgain}
            className="flex-1 py-3 rounded-xl border-2 border-slate-200 text-slate-700 font-bold text-sm inline-flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors"
          >
            <RotateCcw className="w-4 h-4" /> Play Again
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/mini-games")}
            className="flex-1 py-3 rounded-xl bg-emerald-600 text-white font-bold text-sm inline-flex items-center justify-center gap-2 hover:bg-emerald-700 transition-colors"
          >
            Game Hub <ArrowRight className="w-4 h-4" />
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
