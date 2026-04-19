import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./GameHistory.css";
import { BarChart3 } from "lucide-react";
import { fetchGamificationMe } from "../api/gamificationApi";
import { apiRequest } from "../api/httpClient";

function GameHistory() {
  const [history, setHistory] = useState([]);
  const [xpEvents, setXpEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      apiRequest("/api/mini-games/history"),
      fetchGamificationMe({ limit: 25, offset: 0 }).catch(() => null),
    ])
      .then(([games, gamificationRes]) => {
        const gamification = gamificationRes;
        setHistory(Array.isArray(games) ? games : []);
        setXpEvents(Array.isArray(gamification?.events) ? gamification.events : []);
      })
      .catch(() => setHistory([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="game-history-loading">Loading game history...</div>;

  return (
    <div className="game-history-page">
      <div className="game-history-header">
        <h1 className="flex items-center gap-2"><BarChart3 size={28} className="text-emerald-600" strokeWidth={2.5} /> Game History</h1>
        <button className="eco-back-btn" onClick={() => navigate("/mini-games")}>
          ← Back to Games
        </button>
      </div>
      <div className="game-history-list">
        {history.length === 0 ? (
          <p>No games played yet. Start playing eco mini-games to see your history!</p>
        ) : (
          <>
            {history.map((h) => (
              <div key={h._id} className="game-history-card">
                <div className="game-name">{h.game?.name || "Game"}</div>
                <div className="game-details">
                  <span>Score: {h.score}</span>
                  <span>+{h.pointsEarned || 0} pts</span>
                  <span>{new Date(h.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
            {xpEvents.length > 0 && (
              <div className="game-history-card">
                <div className="game-name">XP Timeline</div>
                <div className="game-details" style={{ display: "grid", gap: "8px" }}>
                  {xpEvents.slice(0, 8).map((evt) => (
                    <span key={evt._id}>
                      {new Date(evt.occurredAt || evt.createdAt).toLocaleDateString()} - {evt.source}: +{evt.points} XP
                    </span>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default GameHistory;
