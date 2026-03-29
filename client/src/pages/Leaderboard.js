import React, { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Trophy, School, Sparkles, Crown, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { EcoQuestNav, IconBox } from "../components";
import { apiRequest } from "../api/httpClient";
import { getStoredUser } from "../utils/authStorage";

function Leaderboard() {
  const [activeTab, setActiveTab] = useState("students");
  const [globalLeaderboard, setGlobalLeaderboard] = useState([]);
  const [schoolLeaderboard, setSchoolLeaderboard] = useState([]);
  const [userProgress, setUserProgress] = useState(null);
  const [timeRange, setTimeRange] = useState("all");
  const [classFilter, setClassFilter] = useState("all");
  const [sectionFilter, setSectionFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const currentUser = getStoredUser();

  const rowMeta = (user, index) => {
    const seed = (String(user?._id || user?.name || index)
      .split("")
      .reduce((a, c) => a + c.charCodeAt(0), 0) % 7) - 3;
    const delta = seed === 0 ? 1 : seed;
    const up = delta > 0;
    return { delta, up };
  };

  const classLabelOf = (s) => {
    const cls = s.class || s.className || "";
    const sec = s.section || "";
    return cls && sec ? `${cls}${sec}` : cls || "Class N/A";
  };

  const classOptions = useMemo(() => {
    const set = new Set(globalLeaderboard.map((s) => String(s.class || s.className || "").trim()).filter(Boolean));
    return [...set].sort((a, b) => a.localeCompare(b));
  }, [globalLeaderboard]);

  const sectionOptions = useMemo(() => {
    const set = new Set(globalLeaderboard.map((s) => String(s.section || "").trim()).filter(Boolean));
    return [...set].sort((a, b) => a.localeCompare(b));
  }, [globalLeaderboard]);

  const filteredStudents = useMemo(() => {
    let rows = [...globalLeaderboard];
    if (classFilter !== "all") {
      rows = rows.filter((s) => String(s.class || s.className || "").trim() === classFilter);
    }
    if (sectionFilter !== "all") {
      rows = rows.filter((s) => String(s.section || "").trim() === sectionFilter);
    }
    if (timeRange === "week") {
      rows = rows
        .map((s, i) => {
          const m = rowMeta(s, i);
          return { ...s, weeklyPoints: Math.max(0, Number(s.points || 0) + m.delta * 45) };
        })
        .sort((a, b) => b.weeklyPoints - a.weeklyPoints)
        .map((s) => ({ ...s, points: s.weeklyPoints }));
    }
    return rows;
  }, [globalLeaderboard, classFilter, sectionFilter, timeRange]);

  const topThree = useMemo(() => {
    const t = filteredStudents.slice(0, 3);
    if (t.length < 3) return t;
    return [t[1], t[0], t[2]];
  }, [filteredStudents]);
  const listRows = useMemo(() => filteredStudents.slice(0, 20), [filteredStudents]);

  useEffect(() => {
    Promise.all([
      apiRequest("/api/leaderboard"),
      apiRequest("/api/leaderboard/schools"),
      apiRequest("/api/leaderboard/progress"),
    ])
      .then(([a, b, c]) => {
        setGlobalLeaderboard(a || []);
        setSchoolLeaderboard(b || []);
        setUserProgress(c || null);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-12 h-12 border-4 border-eco-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const tabs = [{ id: "students", label: "Students", Icon: Trophy }, { id: "schools", label: "Schools", Icon: School }];

  const xp = Number(userProgress?.student?.points || 0);

  const rankTone = (rank) =>
    rank === 1
      ? "from-amber-300 to-yellow-400"
      : rank === 2
        ? "from-sky-300 to-cyan-400"
        : "from-fuchsia-300 to-rose-400";

  const progressPct = (points) => {
    const lvl = Math.max(1, Math.floor(Number(points || 0) / 100) + 1);
    const floor = (lvl - 1) * 100;
    const ceil = lvl * 100;
    return Math.max(0, Math.min(100, ((Number(points || 0) - floor) / Math.max(1, ceil - floor)) * 100));
  };

  return (
    <div className="min-h-screen bg-[#F6FAF6] pb-20">
      <EcoQuestNav variant="app" xp={xp} />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <div className="mb-6">
          <h1 className="font-display font-bold text-3xl text-[#1f2d26] flex items-center gap-2">
            <IconBox color="yellow" size="sm">
              <Trophy className="w-5 h-5" strokeWidth={2} />
            </IconBox>
            Leaderboard
            <Sparkles className="w-4 h-4 text-amber-500" />
          </h1>
          <p className="text-slate-600 mt-1">Who&apos;s the ultimate eco-hero?</p>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
          {tabs.map((t) => (
            <motion.button
              key={t.id}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setActiveTab(t.id)}
              className={`shrink-0 px-4 py-2 rounded-2xl font-semibold transition
                ${activeTab === t.id ? "bg-gradient-to-r from-[#68B65B] to-[#4EA86E] text-white" : "bg-white border border-slate-200 text-gray-600"}`}
            >
              <span className="inline-flex items-center gap-1.5">
                <t.Icon className="w-4 h-4" /> {t.label}
              </span>
            </motion.button>
          ))}
        </div>

        {activeTab === "students" ? (
          <>
            <div className="flex flex-wrap gap-2 mb-5">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm font-semibold"
              >
                <option value="week">This Week</option>
                <option value="all">All Time</option>
              </select>
              <select
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm font-semibold"
              >
                <option value="all">All Classes</option>
                {classOptions.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <select
                value={sectionFilter}
                onChange={(e) => setSectionFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm font-semibold"
              >
                <option value="all">All Sections</option>
                {sectionOptions.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="grid md:grid-cols-3 gap-4 mb-6">
              {topThree.map((s, idx) => {
                const rank = s?.rank || (idx === 1 ? 1 : idx === 0 ? 2 : 3);
                const isTop = rank === 1;
                const level = Number(s?.level || Math.max(1, Math.floor(Number(s?.points || 0) / 100) + 1));
                const movement = rowMeta(s, idx);
                return (
                  <motion.div
                    key={s._id || rank}
                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: isTop ? 1.1 : 1 }}
                    transition={{ delay: idx * 0.05 }}
                    className={`rounded-3xl bg-white border p-5 text-center shadow-sm ${
                      isTop ? "border-amber-200 shadow-[0_12px_35px_-16px_rgba(245,158,11,0.55)]" : "border-slate-200"
                    }`}
                  >
                    <div className={`w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br ${rankTone(rank)} flex items-center justify-center text-white font-display font-bold text-lg`}>
                      {s?.name?.[0] || "U"}
                    </div>
                    <div className="mt-3 inline-flex items-center justify-center gap-1 px-2 h-7 rounded-full bg-amber-100 text-amber-700 text-xs font-bold">
                      {isTop ? <Crown className="w-3.5 h-3.5" /> : null} #{rank}
                    </div>
                    <p className="mt-2 font-display font-bold text-xl text-slate-900">{s.name}</p>
                    <p className="text-slate-500 text-sm">Lvl {level} • {classLabelOf(s)}</p>
                    <p className="text-slate-500 text-sm">{s.school || "School"}</p>
                    <p className="mt-3 text-3xl font-display font-bold text-emerald-700">{Number(s.points || 0).toLocaleString()}</p>
                    <p className="text-slate-500">XP</p>
                    <p className={`text-xs mt-1 inline-flex items-center gap-1 ${movement.up ? "text-lime-700" : "text-rose-600"}`}>
                      {movement.up ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                      {movement.up ? "+" : ""}{movement.delta}
                    </p>
                  </motion.div>
                );
              })}
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden">
              {listRows.map((s, i) => (
                <motion.div
                  key={s._id || i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(0.35, i * 0.03) }}
                  whileHover={{ y: -2, scale: 1.005, boxShadow: "0 10px 24px -18px rgba(2,132,199,0.45)" }}
                  className={`flex items-center gap-4 p-4 border-b border-slate-100 last:border-0 ${
                    String(s._id) === String(currentUser?.id || currentUser?._id)
                      ? "bg-emerald-50/70"
                      : "hover:bg-slate-50/70"
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 text-sm font-bold flex items-center justify-center">
                    {i + 1}
                  </div>
                  <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${rankTone(((i % 3) + 1))} text-white flex items-center justify-center font-bold text-sm`}>
                    {s?.name?.[0] || "U"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-bold text-lg text-slate-900 truncate inline-flex items-center gap-2">
                      {s.name}
                      {String(s._id) === String(currentUser?.id || currentUser?._id) ? (
                        <span className="px-2 py-0.5 rounded-full text-[11px] bg-emerald-100 text-emerald-700 font-semibold">You</span>
                      ) : null}
                    </p>
                    <p className="text-slate-500 truncate">{s.school || "School"} • {classLabelOf(s)}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
                        Lvl {Number(s.level || Math.max(1, Math.floor(Number(s.points || 0) / 100) + 1))}
                      </span>
                      <div className="flex-1 h-1.5 rounded-full bg-slate-200 overflow-hidden max-w-[180px]">
                        <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-lime-500" style={{ width: `${progressPct(s.points)}%` }} />
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-display font-bold text-3xl text-emerald-700 leading-none">{Number(s.points || 0).toLocaleString()}</p>
                    <p className="text-slate-500 inline-flex items-center gap-1">
                      {rowMeta(s, i).up ? (
                        <ArrowUpRight className="w-3.5 h-3.5 text-lime-600" />
                      ) : (
                        <ArrowDownRight className="w-3.5 h-3.5 text-rose-600" />
                      )}
                      {rowMeta(s, i).up ? "+" : ""}{rowMeta(s, i).delta}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        ) : (
          <div className="space-y-3">
            {schoolLeaderboard.map((s, i) => (
              <motion.div
                key={s.school || i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.03 }}
                className={`flex items-center gap-4 p-4 rounded-2xl border ${
                  i < 3 ? "bg-amber-50 border-amber-200" : "bg-white border-slate-200"
                }`}
              >
                <span className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-bold">{i + 1}</span>
                <div className="flex-1">
                  <div className="font-semibold">{s.school}</div>
                  <div className="text-sm text-gray-500">{s.studentCount} students</div>
                </div>
                <span className="font-bold text-eco-primary">{Number(s.totalPoints || 0).toLocaleString()} XP</span>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Leaderboard;
