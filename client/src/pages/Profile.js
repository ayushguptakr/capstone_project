import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  GraduationCap,
  Building2,
  Zap,
  Trophy,
  ArrowLeft,
  LogOut,
  Leaf,
} from "lucide-react";
import * as AllIcons from "lucide-react";
import { EcoQuestNav, EcoLoader } from "../components";
import { getStoredUser } from "../utils/authStorage";
import { fetchGamificationMe } from "../api/gamificationApi";
import { apiRequest } from "../api/httpClient";

function initials(name) {
  if (!name || typeof name !== "string") return "?";
  const p = name.trim().split(/\s+/);
  if (p.length >= 2) return (p[0][0] + p[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function roleLabel(role) {
  const m = {
    student: "Student",
    teacher: "Teacher",
    admin: "Admin",
    sponsor: "Sponsor",
  };
  return m[role] || role || "Member";
}

function prettySource(source) {
  const map = {
    quiz: "Quiz",
    game: "Game",
    task: "Task",
    bonus: "Bonus",
    system: "System",
  };
  return map[source] || "Activity";
}

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => getStoredUser());
  const [progress, setProgress] = useState(null);
  const [gamification, setGamification] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [redemptions, setRedemptions] = useState([]);

  const dashPath = user?.role === "teacher" ? "/teacher-dashboard" : "/dashboard";
  const points = progress?.student?.points ?? user?.points ?? 0;
  const rank = progress?.student?.rank;
  const isStudent = user?.role === "student" || user?.role === "sponsor";

  useEffect(() => {
    const u = getStoredUser();
    const token = localStorage.getItem("token");
    if (!u || !token) {
      navigate("/login", { replace: true });
      return;
    }
    setUser(u);

    if (u.role !== "student" && u.role !== "sponsor") {
      setLoading(false);
      return;
    }

    Promise.all([
      apiRequest("/api/leaderboard/progress"), 
      fetchGamificationMe({ limit: 12, offset: 0 }).catch(() => null),
      apiRequest("/api/rewards/my-redemptions").catch(() => [])
    ])
      .then(([progressData, gamificationRes, redemptionsRes]) => {
        const gamificationData = gamificationRes;

        setProgress(progressData);
        setGamification(gamificationData);
        setRedemptions(Array.isArray(redemptionsRes) ? redemptionsRes : []);

        const merged = {
          ...u,
          ...(progressData?.student || {}),
          ...(gamificationData?.summary || {}),
          points:
            gamificationData?.summary?.points ??
            progressData?.student?.points ??
            u.points ??
            0,
          level:
            gamificationData?.summary?.level ??
            progressData?.student?.level ??
            u.level ??
            1,
        };
        setUser(merged);
        try {
          localStorage.setItem("user", JSON.stringify(merged));
        } catch {
          /* ignore */
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [navigate]);

  const handleEquipAvatar = async (iconName) => {
    try {
      const data = await apiRequest("/api/auth/avatar", {
        method: "PUT",
        body: { iconName }
      });
      setUser(data.user);
      localStorage.setItem("user", JSON.stringify(data.user));
    } catch (e) {
      console.error("Equip avatar failed:", e);
    }
  };

  const loadMoreEvents = async () => {
    if (!gamification?.pagination?.hasMore || loadingMore) return;
    setLoadingMore(true);
    try {
      const nextOffset = Number(gamification.pagination.offset || 0) + Number(gamification.pagination.limit || 12);
      const more = await fetchGamificationMe({
        limit: Number(gamification.pagination.limit || 12),
        offset: nextOffset,
      });
      setGamification((prev) => ({
        ...more,
        events: [...(prev?.events || []), ...(more?.events || [])],
      }));
    } catch {
      // ignore pagination failures
    } finally {
      setLoadingMore(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/", { replace: true });
  };

  if (!user) {
    return <EcoLoader />;
  }

  return (
    <div className="min-h-screen bg-[#F9FAF7] pb-16">
      <EcoQuestNav variant="app" xp={points} />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link
            to={dashPath}
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-[#5E9F57] transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={2} />
            Back to dashboard
          </Link>
          <h1 className="font-display font-bold text-3xl text-[#2D332F]">Your profile</h1>
          <p className="text-gray-600 mt-1">Manage how you appear on EcoQuest.</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-3xl bg-white border border-gray-100 shadow-lg shadow-gray-200/50 overflow-hidden"
        >
          <div className="h-24 bg-gradient-to-r from-[#5E9F57] via-eco-primary to-[#81C784]" />
          <div className="px-6 sm:px-8 pb-8 -mt-12">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-6">
              <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl bg-white border-4 border-white shadow-lg text-2xl font-display font-bold text-[#2D332F] ring-2 ring-emerald-100">
                {initials(user.name)}
              </div>
              <div className="flex-1 min-w-0 pt-2 sm:pb-1">
                <h2 className="font-display font-bold text-2xl text-[#2D332F] truncate">{user.name}</h2>
                <span className="inline-flex mt-2 px-3 py-1 rounded-xl bg-[#E8F2E7] text-[#2D332F] text-sm font-semibold">
                  {roleLabel(user.role)}
                </span>
              </div>
            </div>

            <div className="mt-8 space-y-4">
              <div className="flex items-start gap-3 p-4 rounded-2xl bg-gray-50/80 border border-gray-100">
                <Mail className="w-5 h-5 text-gray-500 shrink-0 mt-0.5" strokeWidth={2} />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Email</p>
                  <p className="text-gray-800 font-medium break-all">{user.email}</p>
                </div>
              </div>

              {user.school && (
                <div className="flex items-start gap-3 p-4 rounded-2xl bg-gray-50/80 border border-gray-100">
                  <Building2 className="w-5 h-5 text-gray-500 shrink-0 mt-0.5" strokeWidth={2} />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">School</p>
                    <p className="text-gray-800 font-medium">{user.school}</p>
                  </div>
                </div>
              )}

              {user.className && (
                <div className="flex items-start gap-3 p-4 rounded-2xl bg-gray-50/80 border border-gray-100">
                  <GraduationCap className="w-5 h-5 text-gray-500 shrink-0 mt-0.5" strokeWidth={2} />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Class</p>
                    <p className="text-gray-800 font-medium">{user.className}</p>
                  </div>
                </div>
              )}

              {isStudent && (
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-100">
                    <div className="flex items-center gap-2 text-amber-800 font-semibold text-sm mb-1">
                      <Zap className="w-4 h-4" strokeWidth={2} />
                      XP
                    </div>
                    <p className="font-display font-bold text-2xl text-amber-900 tabular-nums">
                      {loading ? "…" : points.toLocaleString()}
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-emerald-50/90 border border-emerald-100">
                    <div className="flex items-center gap-2 text-emerald-800 font-semibold text-sm mb-1">
                      <Trophy className="w-4 h-4" strokeWidth={2} />
                      Global rank
                    </div>
                    <p className="font-display font-bold text-2xl text-emerald-900 tabular-nums">
                      {loading && isStudent ? "…" : typeof rank === "number" ? `#${rank}` : "—"}
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-orange-50/90 border border-orange-100 col-span-2">
                    <div className="flex items-center gap-2 text-orange-800 font-semibold text-sm mb-1">
                      🔥 Streak
                    </div>
                    <p className="font-display font-bold text-2xl text-orange-900 tabular-nums">
                      {loading ? "…" : `${user.streakCurrent || 0} days`}
                    </p>
                  </div>
                </div>
              )}

              {!isStudent && (
                <div className="p-4 rounded-2xl bg-[#E8F2E7]/50 border border-emerald-100 flex gap-3">
                  <User className="w-5 h-5 text-eco-primary shrink-0" strokeWidth={2} />
                  <p className="text-sm text-gray-700">
                    Teacher accounts use the dashboard to create tasks, review submissions, and view analytics.
                  </p>
                </div>
              )}
            </div>

            <div className="mt-10 pt-8 border-t border-gray-100 flex flex-col sm:flex-row gap-3">
              <Link
                to={dashPath}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-[#5E9F57] to-eco-primary text-white font-display font-bold shadow-md hover:shadow-lg hover:brightness-105 transition-all"
              >
                <Leaf className="w-4 h-4" strokeWidth={2.5} />
                Go to dashboard
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl border-2 border-red-100 text-red-600 font-display font-bold hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4" strokeWidth={2} />
                Log out
              </button>
            </div>
          </div>
        </motion.div>

        {isStudent && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.07 }}
            className="mt-6 rounded-3xl bg-white border border-gray-100 shadow-lg shadow-gray-200/40 p-6"
          >
            <h3 className="font-display font-bold text-xl text-[#2D332F] mb-3">Avatar Wardrobe</h3>
            {redemptions.filter(r => r.reward?.category === "avatars" || r.reward?.category === "creatures").length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {redemptions
                  .filter(r => r.reward?.category === "avatars" || r.reward?.category === "creatures")
                  .map(r => {
                      const IconCmp = AllIcons[r.reward?.icon] || AllIcons.User;
                      const isEquipped = user?.equippedAvatar === r.reward?.icon;
                      return (
                        <div key={r._id} className={`flex flex-col items-center p-4 rounded-2xl border-4 transition-all ${isEquipped ? 'border-[#5E9F57] bg-[#E8F2E7]' : 'border-gray-50 bg-white hover:border-[#bbf7d0]'}`}>
                           <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center mb-2 shadow-sm text-emerald-700">
                              <IconCmp className="w-8 h-8" strokeWidth={2}/>
                           </div>
                           <span className="font-bold text-sm text-center mb-3 h-10 line-clamp-2 leading-tight">{r.reward?.name}</span>
                           <button 
                             onClick={() => handleEquipAvatar(r.reward?.icon)}
                             disabled={isEquipped}
                             className={`w-full py-1.5 rounded-xl font-bold text-sm transition-colors ${isEquipped ? 'bg-[#5E9F57] text-white' : 'bg-gray-100 text-gray-600 hover:bg-emerald-100 hover:text-emerald-800 cursor-pointer'}`}
                           >
                             {isEquipped ? "Equipped" : "Equip"}
                           </button>
                        </div>
                      )
                  })}
              </div>
            ) : (
              <div className="text-center py-6 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <p className="text-gray-500 font-semibold mb-2">Your wardrobe is empty.</p>
                <Link to="/store" className="text-[#5E9F57] font-bold hover:underline">Go to Store</Link>
              </div>
            )}
          </motion.div>
        )}

        {isStudent && gamification?.events?.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="mt-6 rounded-3xl bg-white border border-gray-100 shadow-lg shadow-gray-200/40 p-6"
          >
            <h3 className="font-display font-bold text-xl text-[#2D332F] mb-3">XP Activity</h3>
            <div className="space-y-2">
              {gamification.events.map((evt) => (
                <div
                  key={evt._id}
                  className="rounded-2xl border border-gray-100 bg-gray-50/70 p-3 flex items-center justify-between"
                >
                  <div>
                    <p className="font-semibold text-gray-800">{prettySource(evt.source)}</p>
                    <p className="text-xs text-gray-500">{new Date(evt.occurredAt || evt.createdAt).toLocaleString()}</p>
                  </div>
                  <span className="font-display font-bold text-emerald-700">
                    +{Number(evt.points || 0)} XP
                  </span>
                </div>
              ))}
            </div>
            {gamification?.pagination?.hasMore ? (
              <button
                type="button"
                onClick={loadMoreEvents}
                disabled={loadingMore}
                className="mt-3 w-full rounded-2xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60"
              >
                {loadingMore ? "Loading..." : "Load more activity"}
              </button>
            ) : null}
          </motion.div>
        )}

        <p className="text-center text-xs text-gray-400 mt-8">
          Profile details come from your account. Contact your school admin to change your role or school.
        </p>
      </div>
    </div>
  );
}
