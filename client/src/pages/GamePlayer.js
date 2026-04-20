import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Maximize2, Minimize2, ArrowLeft, Volume2, VolumeX, Loader2 } from "lucide-react";
import gamesConfig from "../data/gamesConfig";
import GameRewardModal from "../components/GameRewardModal";
import { apiRequest } from "../api/httpClient";

/**
 * GamePlayer — Fullscreen iframe-based game launcher.
 * Route: /play/:id
 * Loads games from gamesConfig, supports external HTML5 game URLs.
 * Listens for postMessage from iframe for score reporting.
 */
export default function GamePlayer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showReward, setShowReward] = useState(false);
  const [gameScore, setGameScore] = useState(0);

  const game = gamesConfig.find(g => g.id === id);

  const submitScore = useCallback(async (s) => {
    if (!game) return;
    try {
      await apiRequest("/api/mini-games/submit-score", {
        method: "POST",
        body: {
          gameId: game.id,
          score: s,
          timeSpent: 30 // Approximate or generic time
        }
      });
    } catch (e) {
      console.error("Failed to submit score:", e);
    }
  }, [game]);

  // Listen for game completion messages from iframe
  const handleMessage = useCallback((event) => {
    try {
      const data = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
      if (data.type === "GAME_COMPLETE" || data.type === "game_complete") {
        const s = data.score || 0;
        setGameScore(s);
        submitScore(s);
        setShowReward(true);
      }
    } catch (e) {
      // Ignore non-JSON messages
    }
  }, [submitScore]);

  useEffect(() => {
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [handleMessage]);

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  if (!game) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="text-center">
          <p className="text-xl font-bold mb-2">Game not found</p>
          <button onClick={() => navigate("/mini-games")} className="text-emerald-400 underline text-sm">
            Back to Game Hub
          </button>
        </div>
      </div>
    );
  }

  // For internal games, use route. For external, use externalUrl field.
  const gameUrl = game.externalUrl || null;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Top Control Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800 z-20">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/mini-games")}
            className="flex items-center gap-2 text-slate-400 hover:text-white text-sm font-semibold transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Exit
          </button>
          <div className="w-px h-5 bg-slate-700" />
          <span className="text-white font-bold text-sm">{game.name}</span>
          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 border border-slate-700">
            {game.difficulty}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMuted(m => !m)}
            className="p-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-800"
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <button
            onClick={toggleFullscreen}
            className="p-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-800"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
          <button
            onClick={() => { 
              const s = game.xp || 100;
              setGameScore(s); 
              submitScore(s);
              setShowReward(true); 
            }}
            className="px-3 py-1.5 text-xs font-bold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            End Game
          </button>
        </div>
      </div>

      {/* Game Area */}
      <div className="flex-1 relative">
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-950">
            <div className="text-center">
              <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mx-auto mb-3" />
              <p className="text-slate-400 text-sm font-medium">Loading {game.name}...</p>
            </div>
          </div>
        )}

        {gameUrl ? (
          // External HTML5 game via iframe
          <iframe
            src={gameUrl}
            title={game.name}
            className="w-full h-full border-0"
            onLoad={() => setIsLoading(false)}
            allow="autoplay; fullscreen"
            sandbox="allow-scripts allow-same-origin allow-popups"
            style={{ minHeight: "calc(100vh - 52px)" }}
          />
        ) : (
          // Internal game — show redirect message
          <div className="flex items-center justify-center h-full" style={{ minHeight: "calc(100vh - 52px)" }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center bg-slate-900 rounded-2xl p-8 border border-slate-800 max-w-md"
            >
              <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${game.gradient} flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                <span className="text-3xl text-white font-black">▶</span>
              </div>
              <h2 className="text-white font-bold text-xl mb-2">{game.name}</h2>
              <p className="text-slate-400 text-sm mb-6">{game.desc}</p>
              <button
                onClick={() => game.route && navigate(game.route)}
                className="px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors"
              >
                Launch Game
              </button>
            </motion.div>
          </div>
        )}
      </div>

      {/* Reward Modal */}
      <GameRewardModal
        show={showReward}
        xpEarned={gameScore}
        streakBonus={Math.floor(gameScore * 0.1)}
        ecoImpact={game.ecoImpact}
        gameName={game.name}
        onClose={() => { setShowReward(false); navigate("/mini-games"); }}
        onPlayAgain={() => { setShowReward(false); setGameScore(0); setIsLoading(true); }}
      />
    </div>
  );
}
