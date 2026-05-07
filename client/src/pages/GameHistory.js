import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BarChart3, ArrowLeft, Trophy, Clock3, Sparkles } from "lucide-react";
import { fetchGamificationMe } from "../api/gamificationApi";
import { apiRequest } from "../api/httpClient";

function GameHistory() {
  const [history, setHistory] = useState([]);
  const [xpEvents, setXpEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [offset, setOffset] = useState(0);
  const [limit] = useState(20);
  const [pagination, setPagination] = useState({ total: 0, offset: 0, limit: 20, hasMore: false });
  const navigate = useNavigate();

  useEffect(() => {
    setOffset(0);
  }, []);

  useEffect(() => {
    Promise.all([
      apiRequest(`/api/mini-games/history?limit=${limit}&offset=${offset}`),
      fetchGamificationMe({ limit: 25, offset: 0 }).catch(() => null),
    ])
      .then(([gameRes, gamificationRes]) => {
        const gamification = gamificationRes;
        setHistory(Array.isArray(gameRes) ? gameRes : gameRes?.items || []);
        setPagination(gameRes?.pagination || { total: 0, offset, limit, hasMore: false });
        setXpEvents(Array.isArray(gamification?.events) ? gamification.events : []);
      })
      .catch(() => setHistory([]))
      .finally(() => setLoading(false));
  }, [limit, offset]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-600">
        Loading game history...
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 bg-gradient-to-br from-[#E8F5E9] via-[#F9FAF7] to-[#FFFDE7]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between gap-3 flex-wrap mb-6">
          <div>
            <h1 className="font-display font-extrabold text-3xl text-slate-900 flex items-center gap-3">
              <span className="w-10 h-10 rounded-2xl bg-white/70 backdrop-blur-md border border-emerald-200 flex items-center justify-center shadow-sm">
                <BarChart3 className="w-5 h-5 text-emerald-600" />
              </span>
              Game History
            </h1>
            <p className="text-slate-500 font-medium mt-1">Your recent mini-game runs and XP earned.</p>
          </div>

          <button
            onClick={() => navigate("/mini-games")}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/70 backdrop-blur-md border border-slate-200 text-slate-700 font-bold text-sm shadow-sm hover:shadow transition"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Games
          </button>
        </div>

        {history.length === 0 ? (
          <div className="rounded-[2rem] border border-dashed border-emerald-200/60 bg-white/70 backdrop-blur-xl p-10 text-center text-slate-600 shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-7 h-7 text-emerald-600" />
            </div>
            <div className="font-display font-bold text-xl text-slate-800 mb-1">No game runs yet</div>
            <div className="text-sm text-slate-500 font-medium">Play any mini-game and your runs will appear here automatically.</div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 space-y-3">
              {history.map((h) => (
                <div
                  key={h._id}
                  className="rounded-3xl border border-white/60 bg-white/75 backdrop-blur-xl p-4 shadow-sm hover:shadow-md transition"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-display font-bold text-lg text-slate-900">{h.game?.name || "Game"}</div>
                      <div className="text-xs text-slate-500 font-semibold inline-flex items-center gap-2 mt-1">
                        <Clock3 className="w-3.5 h-3.5" />
                        {new Date(h.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Score</div>
                      <div className="font-display font-extrabold text-2xl text-slate-900 tabular-nums">{h.score}</div>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <div className="text-xs font-semibold text-slate-600">
                      +<span className="font-extrabold text-emerald-700">{Number(h.pointsEarned || 0)}</span> XP
                    </div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
                      <Trophy className="w-4 h-4" /> Logged
                    </div>
                  </div>
                </div>
              ))}

              {pagination.total > 0 && (
                <div className="pt-2 flex items-center justify-between text-xs text-slate-500">
                  <span>
                    Showing {pagination.offset + 1}-{Math.min(pagination.offset + history.length, pagination.total)} of {pagination.total}
                  </span>
                  <div className="flex gap-2">
                    <button
                      disabled={offset <= 0}
                      onClick={() => setOffset(Math.max(0, offset - limit))}
                      className="px-3 py-2 rounded-xl border border-slate-200 bg-white/70 disabled:opacity-40"
                    >
                      Prev
                    </button>
                    <button
                      disabled={!pagination.hasMore}
                      onClick={() => setOffset(offset + limit)}
                      className="px-3 py-2 rounded-xl border border-slate-200 bg-white/70 disabled:opacity-40"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div className="rounded-3xl border border-white/60 bg-white/75 backdrop-blur-xl p-4 shadow-sm">
                <div className="font-display font-bold text-lg text-slate-900 mb-2">XP Timeline</div>
                {xpEvents.length === 0 ? (
                  <div className="text-sm text-slate-500">No XP events found.</div>
                ) : (
                  <div className="space-y-2">
                    {xpEvents.slice(0, 10).map((evt) => (
                      <div key={evt._id} className="flex items-center justify-between gap-2 text-xs">
                        <span className="text-slate-500 font-semibold">
                          {new Date(evt.occurredAt || evt.createdAt).toLocaleDateString()} • {evt.source}
                        </span>
                        <span className="font-extrabold text-emerald-700 tabular-nums">+{evt.points} XP</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default GameHistory;
