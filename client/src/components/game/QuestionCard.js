import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Flame, Zap, CheckCircle, XCircle, ArrowRight, Lightbulb } from "lucide-react";

/**
 * QuestionCard — Renders the current question with timer, streak, and animated choices.
 */
export default function QuestionCard({
  question,
  currentIndex,
  totalRounds,
  timeLeft,
  maxTime,
  selectedIdx,
  isCorrect,
  streakCount,
  multiplier,
  progress,
  phase,
  onAnswer,
  onNext,
}) {
  if (!question) return null;

  const correctIdx = question.choices.findIndex(c => c.correct);
  const timerPct = (timeLeft / maxTime) * 100;
  const timerColor = timeLeft <= 2 ? "bg-red-500" : timeLeft <= 4 ? "bg-amber-500" : "bg-emerald-500";
  const timerTextColor = timeLeft <= 2 ? "text-red-500" : timeLeft <= 4 ? "text-amber-500" : "text-emerald-500";

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Top bar: round + streak + timer */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-bold text-slate-500">
          {currentIndex + 1} / {totalRounds}
        </span>

        {streakCount > 0 && (
          <motion.div
            key={streakCount}
            initial={{ scale: 1.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-orange-50 border border-orange-200"
          >
            <Flame className="w-3.5 h-3.5 text-orange-500" />
            <span className="text-xs font-bold text-orange-600">{streakCount} streak</span>
            <span className="text-[10px] font-black text-orange-500 ml-1">x{multiplier.toFixed(1)}</span>
          </motion.div>
        )}

        <div className="flex items-center gap-2">
          <Clock className={`w-4 h-4 ${timerTextColor}`} />
          <motion.span
            key={timeLeft}
            initial={{ scale: 1.3 }}
            animate={{ scale: 1 }}
            className={`text-sm font-black tabular-nums ${timerTextColor}`}
          >
            {timeLeft}s
          </motion.span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden mb-6">
        <motion.div
          className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
          initial={false}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>

      {/* Timer countdown bar */}
      <div className="h-1 bg-slate-100 rounded-full overflow-hidden mb-6">
        <motion.div
          className={`h-full rounded-full ${timerColor} transition-colors`}
          initial={false}
          animate={{ width: `${timerPct}%` }}
          transition={{ duration: 0.9, ease: "linear" }}
        />
      </div>

      {/* Scenario Card */}
      <motion.div
        key={currentIndex}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="bg-white rounded-2xl border border-slate-200 shadow-[0_8px_32px_rgba(0,0,0,0.06)] p-6 mb-5"
      >
        <div className="flex items-start gap-3 mb-1">
          <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Lightbulb className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase text-slate-400 tracking-wider mb-1">Scenario</p>
            <h2 className="text-lg font-bold text-slate-800 leading-snug">{question.scenario}</h2>
          </div>
        </div>
      </motion.div>

      {/* Choices */}
      <div className="space-y-3">
        <AnimatePresence mode="wait">
          {question.choices.map((choice, idx) => {
            const isSelected = selectedIdx === idx;
            const isCorrectChoice = choice.correct;
            const showResult = phase === "feedback";

            let borderColor = "border-slate-200 hover:border-slate-300";
            let bgColor = "bg-white hover:bg-slate-50";
            let textColor = "text-slate-700";
            let ring = "";

            if (showResult) {
              if (isCorrectChoice) {
                borderColor = "border-emerald-400";
                bgColor = "bg-emerald-50";
                textColor = "text-emerald-800";
                ring = "ring-2 ring-emerald-200";
              } else if (isSelected && !isCorrectChoice) {
                borderColor = "border-red-400";
                bgColor = "bg-red-50";
                textColor = "text-red-700";
                ring = "ring-2 ring-red-200";
              } else {
                bgColor = "bg-slate-50";
                textColor = "text-slate-400";
                borderColor = "border-slate-100";
              }
            }

            return (
              <motion.button
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{
                  opacity: 1,
                  x: 0,
                  ...(showResult && isSelected && !isCorrectChoice ? {
                    x: [0, -8, 8, -6, 6, 0]
                  } : {})
                }}
                transition={{
                  delay: idx * 0.06,
                  ...(showResult && isSelected && !isCorrectChoice ? {
                    x: { duration: 0.4 }
                  } : {})
                }}
                whileHover={!showResult ? { scale: 1.02 } : {}}
                whileTap={!showResult ? { scale: 0.97 } : {}}
                onClick={() => !showResult && onAnswer(idx)}
                disabled={showResult}
                className={`w-full text-left px-4 py-3.5 rounded-xl border-2 font-semibold text-sm transition-all flex items-center gap-3 ${borderColor} ${bgColor} ${textColor} ${ring}`}
              >
                <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0 ${
                  showResult && isCorrectChoice
                    ? "bg-emerald-500 text-white"
                    : showResult && isSelected && !isCorrectChoice
                    ? "bg-red-500 text-white"
                    : "bg-slate-100 text-slate-500"
                }`}>
                  {showResult && isCorrectChoice ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : showResult && isSelected && !isCorrectChoice ? (
                    <XCircle className="w-4 h-4" />
                  ) : (
                    String.fromCharCode(65 + idx)
                  )}
                </span>
                <span className="flex-1">{choice.text}</span>
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Feedback panel */}
      <AnimatePresence>
        {phase === "feedback" && (
          <motion.div
            initial={{ opacity: 0, y: 12, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="mt-4"
          >
            <div className={`rounded-xl p-4 border ${
              isCorrect
                ? "bg-emerald-50 border-emerald-200"
                : "bg-red-50 border-red-200"
            }`}>
              <div className="flex items-start gap-3">
                {isCorrect ? (
                  <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <p className={`font-bold text-sm ${isCorrect ? "text-emerald-700" : "text-red-700"}`}>
                    {isCorrect ? "Correct!" : "Not quite!"}
                  </p>
                  <p className={`text-xs mt-0.5 ${isCorrect ? "text-emerald-600" : "text-red-600"}`}>
                    {question.explanation}
                  </p>
                </div>
              </div>
            </div>

            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={onNext}
              className="mt-3 w-full py-3 rounded-xl bg-slate-900 text-white font-bold text-sm inline-flex items-center justify-center gap-2"
            >
              {currentIndex < totalRounds - 1 ? (
                <>Continue <ArrowRight className="w-4 h-4" /></>
              ) : (
                <>See Results <Zap className="w-4 h-4" /></>
              )}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
