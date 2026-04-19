import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Star, ArrowRight, RotateCcw } from "lucide-react";
import confetti from "canvas-confetti";

export default function QuizRewardModal({
  score = 0,
  totalPossible = 0,
  percentage = 0,
  masteryData = null,
  onPlayAgain,
  onClose,
  show = false
}) {
  const [celebrated, setCelebrated] = useState(false);

  useEffect(() => {
    if (show && !celebrated) {
      setCelebrated(true);
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    }
  }, [show, celebrated]);

  if (!show) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        />

        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-sm bg-white rounded-[2rem] shadow-2xl overflow-hidden shadow-emerald-900/20"
        >
          {/* Header Area */}
          <div className="pt-8 pb-4 px-6 text-center">
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", delay: 0.1, stiffness: 200 }}
              className="w-20 h-20 mx-auto bg-amber-50 rounded-2xl flex items-center justify-center mb-4 border-2 border-amber-100 shadow-inner"
            >
              <Trophy className="w-10 h-10 text-amber-500" strokeWidth={2} />
            </motion.div>
            
            <h2 className="font-display font-black text-2xl text-slate-800 mb-1">Quiz Complete!</h2>
            <p className="text-slate-500 text-sm font-medium">
              You earned <span className="font-bold text-amber-600">+{score} XP</span> out of {totalPossible}
            </p>
          </div>

          {/* Stats Bar */}
          <div className="px-6 py-2">
            <div className={`p-4 rounded-2xl flex flex-col items-center justify-center gap-1 border-2 ${masteryData?.starsEarned === 3 ? 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200' : 'bg-slate-50 border-slate-100'}`}>
              
              <div className="flex gap-2 mb-1">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.3 + i * 0.15, type: "spring" }}
                  >
                    <Star className={`w-8 h-8 ${i < (masteryData?.starsEarned || 0) ? 'fill-amber-400 text-amber-500' : 'fill-slate-200 text-slate-300'}`} />
                  </motion.div>
                ))}
              </div>
              
              <span className="font-black text-xl text-slate-700">{percentage.toFixed(0)}% Accuracy</span>
              
              {/* Contextual Direction / Deltas */}
              {masteryData?.newBest > 0 && (
                <span className="text-sm font-bold text-indigo-600 mt-1 flex items-center gap-1">
                  You improved by +{masteryData.newBest} <Trophy className="w-3 h-3" />
                </span>
              )}

              {/* Progress Hook */}
              {(masteryData?.starsEarned || 0) < 1 ? (
                <span className="text-xs font-bold text-slate-500 mt-2 bg-white px-3 py-1 rounded-full shadow-sm border border-slate-200">
                  Earn 1 star to unlock the next quiz
                </span>
              ) : (masteryData?.starsEarned || 0) < 3 ? (
                <span className="text-xs font-bold text-amber-600 mt-2 bg-white px-3 py-1 rounded-full shadow-sm border border-amber-100">
                  Almost perfect! Keep going!
                </span>
              ) : null}

            </div>
          </div>

          {/* Actions */}
          <div className="p-6 flex flex-col gap-3">
             <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-lg inline-flex items-center justify-center gap-2 shadow-lg shadow-emerald-200 hover:shadow-xl transition-all"
              >
                Continue <ArrowRight className="w-5 h-5" />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onPlayAgain}
                className="w-full py-3 rounded-xl border-2 border-slate-200 text-slate-500 font-bold text-sm hover:bg-slate-50 transition-colors inline-flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" /> Try Again
              </motion.button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
