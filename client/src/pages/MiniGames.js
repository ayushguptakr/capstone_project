import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { apiRequest } from "../api/httpClient";
import {
  Gamepad2, Recycle, Brain, Globe, Zap, Sprout, Clock3,
  Play, Lock, Flame, Star, ChevronLeft, ChevronRight
} from "lucide-react";

import gamesConfigRaw from "../data/gamesConfig";

// ── Icon mapping (config can't store React components) ─────────────

const ID_ICON = {
  "eco-memory": Brain, "waste-sorting": Recycle, "trivia-race": Zap,
  "climate-hero": Globe, "plant-growth": Sprout, "ecosystem-builder": Sprout,
  "eco-speed-round": Zap, "eco-habit": Sprout
};
const PLAY_COUNTS = {
  "eco-memory": 2841, "waste-sorting": 3672, "trivia-race": 1953,
  "climate-hero": 2104, "plant-growth": 1587, "eco-habit": 4210
};

const games = gamesConfigRaw.map(g => ({
  ...g,
  Icon: ID_ICON[g.id] || Sprout,
  plays: PLAY_COUNTS[g.id] || 0
}));

const CATEGORIES = [
  { id: "all", label: "All Games", icon: Gamepad2 },
  { id: "learning", label: "Learning", icon: Brain },
  { id: "action", label: "Action Games", icon: Flame },
  { id: "quiz", label: "Quiz", icon: Target },
  { id: "quick", label: "Quick Play", icon: Zap },
];

const SECTIONS = [
  { id: "trending", title: "Trending Games", icon: "🔥", filter: g => g.section === "trending" },
  { id: "learn", title: "Learn & Play", icon: "🧠", filter: g => g.section === "learn" },
  { id: "quick", title: "Quick XP Games", icon: "⚡", filter: g => g.section === "quick" },
];

const diffColor = { easy: "text-emerald-600 bg-emerald-50 border-emerald-200", medium: "text-amber-600 bg-amber-50 border-amber-200", hard: "text-red-600 bg-red-50 border-red-200" };

// ── Horizontal Scroll Row ──────────────────────────────────────────
function ScrollRow({ children }) {
  const ref = useRef(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);

  const checkScroll = () => {
    const el = ref.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  useEffect(() => { checkScroll(); }, [children]);

  const scroll = (dir) => {
    ref.current?.scrollBy({ left: dir * 320, behavior: "smooth" });
    setTimeout(checkScroll, 400);
  };

  return (
    <div className="relative group/row">
      {canLeft && (
        <button onClick={() => scroll(-1)} className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/90 shadow-lg border border-slate-200 flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity hover:bg-white -translate-x-3">
          <ChevronLeft className="w-5 h-5 text-slate-600" />
        </button>
      )}
      <div ref={ref} onScroll={checkScroll} className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide scroll-smooth" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
        {children}
      </div>
      {canRight && (
        <button onClick={() => scroll(1)} className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/90 shadow-lg border border-slate-200 flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity hover:bg-white translate-x-3">
          <ChevronRight className="w-5 h-5 text-slate-600" />
        </button>
      )}
    </div>
  );
}

// ── Game Card ──────────────────────────────────────────────────────
function GameCard({ game, onPlay, userLevel }) {
  const isLocked = !game.playable || userLevel < game.unlockLevel;

  return (
    <motion.div
      whileHover={isLocked ? {} : { scale: 1.04, y: -6 }}
      whileTap={isLocked ? {} : { scale: 0.97 }}
      onClick={() => !isLocked && onPlay(game)}
      className={`relative flex-shrink-0 w-[260px] rounded-2xl overflow-hidden border cursor-pointer group transition-shadow ${
        isLocked ? "border-slate-200 opacity-70" : "border-slate-200/60 hover:shadow-[0_12px_40px_rgba(0,0,0,0.12)]"
      }`}
    >
      {/* Thumbnail */}
      <div className={`relative h-36 bg-gradient-to-br ${game.gradient} flex items-center justify-center overflow-hidden`}>
        <game.Icon className="w-16 h-16 text-white/25 absolute -right-3 -bottom-3" strokeWidth={1.5} />
        <game.Icon className="w-12 h-12 text-white drop-shadow-lg" strokeWidth={2} />

        {/* Hover Play Overlay */}
        {!isLocked && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
            <motion.div initial={false} className="flex items-center gap-2 bg-white text-slate-900 font-bold px-5 py-2.5 rounded-xl shadow-lg text-sm">
              <Play className="w-4 h-4 fill-current" /> Play Now
            </motion.div>
          </div>
        )}

        {/* Lock Overlay */}
        {isLocked && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center gap-1">
            <Lock className="w-7 h-7 text-white/90" />
            <span className="text-white/90 text-xs font-bold">Unlock at Level {game.unlockLevel}</span>
          </div>
        )}

        {/* XP Badge */}
        <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-md text-white text-xs font-bold px-2.5 py-1 rounded-lg flex items-center gap-1">
          <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {game.xp} XP
        </div>
      </div>

      {/* Info */}
      <div className="bg-white p-4">
        <h3 className="font-bold text-slate-800 text-sm leading-tight mb-1.5 truncate">{game.name}</h3>
        <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 mb-3">{game.desc}</p>
        <div className="flex items-center justify-between">
          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md border ${diffColor[game.difficulty]}`}>
            {game.difficulty}
          </span>
          <div className="flex items-center gap-3 text-[11px] text-slate-400 font-medium">
            <span className="flex items-center gap-1"><Clock3 className="w-3 h-3" />{game.duration}</span>
            <span className="flex items-center gap-1"><Gamepad2 className="w-3 h-3" />{game.plays > 0 ? `${(game.plays / 1000).toFixed(1)}k` : "New"}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ── Next Goal Hint Helper ─────────────────────────────────────────
function getNextGoalHint(level, score, stars) {
  if (stars === 3) return "Mastered! ✨";
  if (stars === 0) return "Complete to unlock next level";
  if (stars === 1) return "Get a higher score for 2 stars!";
  if (stars === 2) return "So close to mastery!";
  return "Play to earn stars";
}

// ── Level Selection Modal ─────────────────────────────────────────
function LaunchModal({ game, onClose, onLaunch, userProgress }) {
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [countdown, setCountdown] = useState(null);

  // Progress for this specific game
  const progress = userProgress?.[game.id] || {
    unlockedLevel: 1, scores: [0,0,0], stars: [0,0,0]
  };

  useEffect(() => {
    if (countdown === null) return;
    if (countdown <= 0) { onLaunch(selectedLevel); return; }
    const t = setTimeout(() => setCountdown(c => c - 1), 800);
    return () => clearTimeout(t);
  }, [countdown, onLaunch, selectedLevel]);

  const handleSelectLevel = (level) => {
    if (level > progress.unlockedLevel) return;
    setSelectedLevel(level);
    setCountdown(3);
  };

  const LevelCard = ({ level, label }) => {
    const isLocked = level > progress.unlockedLevel;
    const isSelected = selectedLevel === level;
    const stars = progress.stars[level - 1] || 0;
    const bestScore = progress.scores[level - 1] || 0;
    const isMastered = stars === 3;

    return (
      <button
        disabled={isLocked || countdown !== null}
        onClick={() => handleSelectLevel(level)}
        className={`relative w-full p-4 mb-3 rounded-2xl border-2 text-left transition-all overflow-hidden ${
          isLocked 
            ? "border-transparent bg-slate-800/50 cursor-not-allowed opacity-80" 
            : isSelected 
              ? "border-emerald-400 bg-slate-800"
              : "border-slate-700 bg-slate-800/80 hover:border-slate-600 hover:bg-slate-800"
        }`}
      >
        <div className="flex items-center justify-between relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className={`font-bold ${isLocked ? "text-slate-500" : "text-white"}`}>
                Level {level} <span className="text-sm font-normal text-slate-400">— {label}</span>
              </span>
              {isMastered && <span className="text-[10px] uppercase font-bold bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded">Mastered</span>}
            </div>
            
            {!isLocked && (
              <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                <span>Best: {bestScore}</span>
                <span className="w-1 h-1 rounded-full bg-slate-600" />
                <span className="text-emerald-400">{getNextGoalHint(level, bestScore, stars)}</span>
              </div>
            )}
            {isLocked && <div className="text-xs text-slate-500 mt-1">Locked — Complete Level {level - 1}</div>}
          </div>

          <div className="flex items-center gap-1">
            {isLocked ? (
              <Lock className="w-5 h-5 text-slate-600" />
            ) : (
              [1, 2, 3].map(s => (
                <Star key={s} className={`w-4 h-4 ${stars >= s ? "fill-amber-400 text-amber-400" : "text-slate-600"}`} />
              ))
            )}
          </div>
        </div>
      </button>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4"
    >
      {countdown === null && (
        <button onClick={onClose} className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors">
          <X className="w-8 h-8" />
        </button>
      )}

      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0 }} transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="w-full max-w-sm"
      >
        {countdown !== null ? (
          <div className="text-center py-10">
            <h2 className="font-bold text-white text-2xl mb-2">Level {selectedLevel}</h2>
            <p className="text-emerald-400 text-sm mb-8 font-medium">Get ready...</p>
            <motion.div
              key={countdown}
              initial={{ scale: 1.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="text-7xl font-black text-white"
            >
              {countdown > 0 ? countdown : "GO!"}
            </motion.div>
          </div>
        ) : (
          <>
            <div className="text-center mb-6">
              <div className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${game.gradient} flex items-center justify-center mx-auto mb-4 shadow-xl`}>
                <game.Icon className="w-10 h-10 text-white" strokeWidth={2} />
              </div>
              <h2 className="font-bold text-white text-2xl mb-1">{game.name}</h2>
              <p className="text-slate-400 text-sm">Select your challenge level</p>
            </div>

            <div className="mt-6">
              <LevelCard level={1} label="Easy" />
              <LevelCard level={2} label="Medium" />
              <LevelCard level={3} label="Hard" />
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}

// ── Main Component ────────────────────────────────────────────────
function MiniGames() {
  const navigate = useNavigate();
  
  const { playClick } = useSound();
  

  const [activeCategory, setActiveCategory] = useState("all");
  const [launchGame, setLaunchGame] = useState(null);
  const [dailyPlayed, setDailyPlayed] = useState(0);
  const [userProgress, setUserProgress] = useState({});
  const [userLevel, setUserLevel] = useState(1);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const res = await apiRequest("/api/gamification/me");
        if (res.summary?.miniGameProgress) {
          setUserProgress(res.summary.miniGameProgress);
        }
        if (res.summary?.level) {
          setUserLevel(res.summary.level);
        }
      } catch (err) {
        console.error("Failed to fetch gamification progress", err);
      }
    };
    fetchProgress();
  }, []);

  const filteredGames = activeCategory === "all"
    ? games
    : games.filter(g => g.categories.includes(activeCategory));

  const handlePlay = (game) => {
    playClick();
    setLaunchGame(game);
  };

  const handleLaunch = useCallback((level = 1) => {
    if (!launchGame) return;
    setDailyPlayed(p => p + 1);
    const route = launchGame.route || `/play/${launchGame.id}`;
    navigate(`${route}?level=${level}`);
  }, [launchGame, navigate]);

  const dailyChallengeComplete = dailyPlayed >= 2;

  return (
    <div className="min-h-screen bg-[#F6FAF6] pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">

        {/* ── Header ────────────────────────────────────────── */}
        <div className="mb-6">
          <h1 className="font-display font-bold text-3xl text-[#1f2d26] flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
              <Gamepad2 className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            Game Hub
          </h1>
          <p className="text-gray-500 mt-1 text-sm">Play eco-games, earn XP, and build your streak.</p>
        </div>

        {/* ── Daily Challenge Banner ────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className={`mb-6 rounded-2xl p-4 sm:p-5 border flex items-center justify-between flex-wrap gap-3 ${
            dailyChallengeComplete
              ? "bg-emerald-50 border-emerald-200"
              : "bg-gradient-to-r from-indigo-50 to-violet-50 border-indigo-200"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              dailyChallengeComplete ? "bg-emerald-500" : "bg-indigo-500"
            }`}>
              {dailyChallengeComplete
                ? <Trophy className="w-5 h-5 text-white" />
                : <Target className="w-5 h-5 text-white" />
              }
            </div>
            <div>
              <p className="font-bold text-sm text-slate-800">
                {dailyChallengeComplete ? "Daily Challenge Complete!" : "🌍 Daily Challenge"}
              </p>
              <p className="text-xs text-slate-500">
                {dailyChallengeComplete
                  ? "You've earned your bonus +50 XP today!"
                  : `Play ${2 - dailyPlayed} more game${2 - dailyPlayed !== 1 ? "s" : ""} → earn +50 XP`
                }
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {[0, 1].map(i => (
                <div key={i} className={`w-6 h-2 rounded-full transition-colors ${
                  i < dailyPlayed ? (dailyChallengeComplete ? "bg-emerald-500" : "bg-indigo-500") : "bg-slate-200"
                }`} />
              ))}
            </div>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
              dailyChallengeComplete ? "bg-emerald-100 text-emerald-700" : "bg-indigo-100 text-indigo-700"
            }`}>
              {dailyChallengeComplete ? "✓ Done" : "+50 XP"}
            </span>
          </div>
        </motion.div>

        {/* ── Category Tabs ─────────────────────────────────── */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-1 scrollbar-hide" style={{ scrollbarWidth: "none" }}>
          {CATEGORIES.map(cat => {
            const active = activeCategory === cat.id;
            return (
              <motion.button
                key={cat.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => { playClick(); setActiveCategory(cat.id); }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all border ${
                  active
                    ? "bg-slate-900 text-white border-slate-900 shadow-lg"
                    : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <cat.icon className="w-4 h-4" />
                {cat.label}
              </motion.button>
            );
          })}
        </div>

        {/* ── Sections (Horizontal Scroll) ─────────────────── */}
        {activeCategory === "all" ? (
          SECTIONS.map(section => {
            const sectionGames = filteredGames.filter(section.filter);
            if (sectionGames.length === 0) return null;
            return (
              <div key={section.id} className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-display font-bold text-lg text-slate-800 flex items-center gap-2">
                    <span className="text-xl">{section.icon}</span> {section.title}
                  </h2>
                  <span className="text-xs font-medium text-slate-400">{sectionGames.length} games</span>
                </div>
                <ScrollRow>
                  {sectionGames.map(g => (
                    <GameCard key={g.id} game={g} onPlay={handlePlay} userLevel={userLevel} />
                  ))}
                </ScrollRow>
              </div>
            );
          })
        ) : (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-lg text-slate-800">
                {CATEGORIES.find(c => c.id === activeCategory)?.label || "Games"}
              </h2>
              <span className="text-xs font-medium text-slate-400">{filteredGames.length} games</span>
            </div>
            {filteredGames.length === 0 ? (
              <div className="text-center py-16 text-slate-400">
                <Gamepad2 className="w-10 h-10 mx-auto mb-3 opacity-40" />
                <p className="font-semibold">No games in this category yet</p>
              </div>
            ) : (
              <ScrollRow>
                {filteredGames.map(g => (
                  <GameCard key={g.id} game={g} onPlay={handlePlay} userLevel={userLevel} />
                ))}
              </ScrollRow>
            )}
          </div>
        )}

        {/* ── Game History Button ───────────────────────────── */}
        <motion.button
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={() => { playClick(); navigate("/game-history"); }}
          className="mt-2 w-full py-3.5 rounded-2xl border-2 border-slate-300 text-slate-600 font-bold inline-flex items-center justify-center gap-2 hover:border-slate-400 hover:bg-slate-50 transition-colors"
        >
          <BarChart3 className="w-5 h-5" /> View Game History
        </motion.button>
      </div>

      {/* ── Launch Modal ─────────────────────────────────── */}
      <AnimatePresence>
        {launchGame && (
          <LaunchModal
            game={launchGame}
            userProgress={userProgress}
            onClose={() => setLaunchGame(null)}
            onLaunch={handleLaunch}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default MiniGames;
