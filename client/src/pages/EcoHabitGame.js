import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Leaf, Play, Star, Clock, Flame, ArrowLeft, Zap } from "lucide-react";
import useGameLogic from "../hooks/useGameLogic";
import QuestionCard from "../components/game/QuestionCard";
import GameRewardModal from "../components/GameRewardModal";
import gamesConfig from "../data/gamesConfig";
import { apiRequest } from "../api/httpClient";

/**
 * EcoHabitGame — "Eco Habit Challenge"
 * Duolingo-level polished quiz game about sustainable daily habits.
 */
export default function EcoHabitGame() {
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(window.location.search);
  const level = parseInt(searchParams.get("level")) || 1;
  const game = useGameLogic(level);
  const [scoreSubmitted, setScoreSubmitted] = React.useState(false);
  const [masteryData, setMasteryData] = React.useState(null);
  
  const gameConfig = gamesConfig.find(g => g.id === "eco-habit");

  React.useEffect(() => {
    if (game.phase === "ended" && !scoreSubmitted) {
      setScoreSubmitted(true);
      apiRequest("/api/mini-games/submit-score", {
        method: "POST",
        body: {
          gameId: "eco-habit",
          level,
          score: game.score,
          timeSpent: game.totalRounds * game.maxTime
        }
      }).then((resp) => {
        if (resp.mastery) setMasteryData(resp.mastery);
      }).catch(console.error);
    }
  }, [game.phase, game.score, scoreSubmitted, level, game.totalRounds, game.maxTime]);

  // ── Ready Screen ───────────────────────────────────────────────
  if (game.phase === "ready") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="w-full max-w-md text-center"
        >
          {/* Hero Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1, rotate: [0, -5, 5, 0] }}
            transition={{ type: "spring", stiffness: 300, delay: 0.2 }}
            className="w-24 h-24 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mx-auto mb-6 shadow-xl"
          >
            <Leaf className="w-12 h-12 text-white" strokeWidth={2} />
          </motion.div>

          <h1 className="font-display font-black text-3xl text-slate-800 mb-2">
            Eco Habit Challenge
          </h1>
          <p className="text-slate-500 text-sm mb-8 max-w-xs mx-auto">
            Test your sustainability knowledge through real-life scenarios. Make the right choices!
          </p>

          {/* Game info chips */}
          <div className="flex items-center justify-center gap-3 mb-8 flex-wrap">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-600">
              <Star className="w-3.5 h-3.5 text-amber-500" /> {game.totalRounds} Rounds
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-600">
              <Clock className="w-3.5 h-3.5 text-indigo-500" /> {game.maxTime}s Timer
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-600">
              <Flame className="w-3.5 h-3.5 text-orange-500" /> Streak x3
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-600">
              <Zap className="w-3.5 h-3.5 text-emerald-500" /> Up to 500 XP
            </div>
          </div>

          {/* Play Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={game.startGame}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-lg inline-flex items-center justify-center gap-3 shadow-lg shadow-emerald-200 hover:shadow-xl hover:shadow-emerald-300 transition-shadow"
          >
            <Play className="w-5 h-5 fill-white" /> Start Game
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/mini-games")}
            className="mt-3 w-full py-3 rounded-xl text-slate-500 font-semibold text-sm inline-flex items-center justify-center gap-2 hover:text-slate-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Games
          </motion.button>
        </motion.div>
      </div>
    );
  }

  // ── End Screen ─────────────────────────────────────────────────
  if (game.phase === "ended") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
        <GameRewardModal
          show={true}
          xpEarned={game.score}
          streakBonus={Math.floor(game.score * 0.1)}
          ecoImpact={gameConfig?.ecoImpact}
          gameName={gameConfig?.name || "Eco Habit"}
          masteryData={masteryData}
          onPlayAgain={game.startGame}
          onClose={() => navigate("/mini-games")}
        />
      </div>
    );
  }

  // ── Playing / Feedback ─────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Minimal top bar */}
      <div className="flex items-center justify-between px-4 py-3 max-w-lg mx-auto">
        <button
          onClick={() => navigate("/mini-games")}
          className="text-slate-400 hover:text-slate-600 text-sm font-semibold flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Exit
        </button>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-50 border border-amber-200">
          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
          <span className="text-xs font-black text-amber-700 tabular-nums">{game.score}</span>
        </div>
      </div>

      {/* Game Content */}
      <div className="px-4 py-4">
        <QuestionCard
          question={game.currentQuestion}
          currentIndex={game.currentIndex}
          totalRounds={game.totalRounds}
          timeLeft={game.timeLeft}
          maxTime={game.maxTime}
          selectedIdx={game.selectedIdx}
          isCorrect={game.isCorrect}
          streakCount={game.streakCount}
          multiplier={game.multiplier}
          progress={game.progress}
          phase={game.phase}
          onAnswer={game.handleAnswer}
          onNext={game.nextQuestion}
        />
      </div>
    </div>
  );
}
