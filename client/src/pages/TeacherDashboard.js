import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ShieldAlert, Trophy, Users, ClipboardCheck, Award, Sparkles } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import TeacherShell from "../components/TeacherShell";
import { fetchTeacherBootstrap } from "../api/teacherApi";
import { apiRequest } from "../api/httpClient";
import { useAuth } from "../context/AuthContext";

function TeacherDashboard() {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [verificationQueue, setVerificationQueue] = useState([]);
  const [events, setEvents] = useState([]);
  const [aiInsight, setAiInsight] = useState("");
  const [aiRefreshing, setAiRefreshing] = useState(false);
  const { user, isLoggedIn } = useAuth();

  useEffect(() => {
    if (!isLoggedIn || !user) return;
    
    async function load() {
      try {
        const [data, eventsData, aiData] = await Promise.all([
          fetchTeacherBootstrap(),
          apiRequest("/api/events").catch(() => ({ events: [] })),
          apiRequest("/api/teacher/ai-insights").catch(() => null)
        ]);
        if (data) {
          setAnalytics(data.analytics || null);
          setVerificationQueue(data.verificationQueue || []);
        }
        if (eventsData) setEvents(eventsData.events || []);
        if (aiData) {
          setAiInsight(aiData.text || "");
          setAiRefreshing(aiData.refreshing || false);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user, isLoggedIn]);

  const students = useMemo(() => analytics?.students || [], [analytics?.students]);
  const createdTaskCount = analytics?.contentCreated?.tasks ?? 0;
  const createdQuizCount = analytics?.contentCreated?.quizzes ?? 0;
  const pendingCount = verificationQueue.length;

  const inactiveStudents = students.filter((s) => (s.points || 0) < 40).slice(0, analytics?.inactiveStudentsCount || 9999);

  const classRows = useMemo(() => {
    if (Array.isArray(analytics?.classMetrics) && analytics.classMetrics.length > 0) {
      return analytics.classMetrics;
    }
    const groups = new Map();
    students.forEach((s, idx) => {
      const className = s.school || `Class ${String.fromCharCode(65 + (idx % 4))}`;
      const current = groups.get(className) || { className, students: 0, xp: 0 };
      current.students += 1;
      current.xp += s.points || 0;
      groups.set(className, current);
    });
    return [...groups.values()].map((row) => {
      const avgXP = row.students ? Math.round(row.xp / row.students) : 0;
      const engagement = Math.max(30, Math.min(100, Math.round(avgXP / 7)));
      const completion = Math.max(20, Math.min(100, Math.round(avgXP / 9)));
      return { ...row, avgXP, engagement, completion };
    });
  }, [students, analytics?.classMetrics]);

  const classLeaderboard = useMemo(() => {
    return classRows
      .map((c) => ({
        ...c,
        score: Math.round(c.avgXP + c.completion * 10 + c.engagement * 8),
      }))
      .sort((a, b) => b.score - a.score)
      .map((c, index) => ({ ...c, rank: index + 1 }));
  }, [classRows]);

  const teacherLeaderboard = useMemo(() => {
    if (Array.isArray(analytics?.teacherLeaderboard) && analytics.teacherLeaderboard.length > 0) {
      return analytics.teacherLeaderboard;
    }
    return [];
  }, [analytics]);

  const alerts = [
    {
      id: "pending",
      text: `⚠️ ${pendingCount} submissions need review`,
      level: pendingCount >= 5 ? "urgent" : pendingCount > 0 ? "warning" : "ok",
    },
    {
      id: "inactive",
      text: `⚠️ ${inactiveStudents.length} students inactive for 3+ days`,
      level: inactiveStudents.length >= 10 ? "urgent" : inactiveStudents.length > 0 ? "warning" : "ok",
    },
  ];

  const weakTopic = useMemo(() => {
    if (analytics?.weakTopic) return analytics.weakTopic;
    const attempts = analytics?.recentActivity || [];
    if (!attempts.length) return "Water conservation";
    const low = attempts.filter((a) => Number(a.percentage || 0) < 65);
    if (low.length > Math.ceil(attempts.length / 3)) return "Waste segregation";
    return "Biodiversity";
  }, [analytics]);

  const weakestClass = useMemo(() => {
    if (!classRows.length) return null;
    return [...classRows].sort((a, b) => (a.avgXP || 0) - (b.avgXP || 0))[0];
  }, [classRows]);

  const engagementData = classRows.map((c) => ({
    name: c.className.slice(0, 10),
    Engagement: c.engagement,
    Completion: c.completion,
  }));


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7FBF8]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-11 h-11 border-4 border-eco-primary border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <TeacherShell
      title="Dashboard"
      subtitle="Overview of engagement, risk alerts, and class performance."
    >
      <section className="grid md:grid-cols-4 gap-4">
        {[
          { label: "Total Students", value: students.length, icon: Users },
          { label: "Pending Submissions", value: pendingCount, icon: ClipboardCheck, urgent: pendingCount > 0 },
          { label: "Quizzes Created", value: createdQuizCount, icon: Trophy },
          { label: "Tasks Created", value: createdTaskCount, icon: Trophy },
        ].map((card) => (
          <motion.article
            key={card.label}
            whileHover={{ y: -3 }}
            className={`rounded-2xl border p-4 bg-white ${
              card.urgent ? "border-red-200 bg-red-50/50" : "border-slate-200"
            }`}
          >
            <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold">{card.label}</p>
            <p className="mt-2 text-3xl font-display font-bold">{card.value}</p>
          </motion.article>
        ))}
      </section>

      <section className="grid lg:grid-cols-2 gap-4">
        {alerts.map((a) => (
          <div
            key={a.id}
            className={`rounded-2xl border p-4 text-sm font-semibold ${
              a.level === "urgent"
                ? "bg-red-50 border-red-200 text-red-700"
                : a.level === "warning"
                  ? "bg-yellow-50 border-yellow-200 text-yellow-700"
                  : "bg-emerald-50 border-emerald-200 text-emerald-700"
            }`}
          >
            {a.text}
          </div>
        ))}
      </section>

      <section className="grid xl:grid-cols-3 gap-4">
        {/* NEW AI INSIGHT BOX */}
        <article className="xl:col-span-3 rounded-2xl bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 border border-purple-100 p-5 shadow-sm relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-200 blur-3xl opacity-40 rounded-full" />
          <h2 className="font-display font-bold text-xl mb-2 flex items-center gap-2 text-indigo-900">
            <Sparkles className="w-6 h-6 text-indigo-500" strokeWidth={2} /> AI Copilot
            {aiRefreshing && <span className="text-xs font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-600 animate-pulse">Refreshing...</span>}
          </h2>
          {aiInsight ? (
            <div>
              <p className="text-indigo-800 font-medium leading-relaxed max-w-4xl relative z-10">
                {aiInsight}
              </p>
              <div className="mt-4 flex gap-3 relative z-10">
                <button 
                  onClick={() => window.location.href = '/teacher/tasks'}
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold shadow hover:bg-indigo-700 transition text-sm"
                >
                  Create Mission
                </button>
                <button 
                  onClick={() => window.location.href = '/teacher/quizzes'}
                  className="px-4 py-2 rounded-xl bg-white text-indigo-700 font-bold shadow hover:bg-indigo-50 border border-indigo-100 transition text-sm"
                >
                  Assign Quiz
                </button>
              </div>
            </div>
          ) : (
            <div className="flex gap-2 items-center text-indigo-400 font-medium">
              <span className="animate-pulse">Generating insights...</span>
            </div>
          )}
        </article>

        <article className="xl:col-span-2 rounded-2xl bg-white border border-slate-200 p-5">
          <h2 className="font-display font-bold text-xl mb-3">Insights</h2>
          <div style={{ width: "100%", height: "300px" }}>
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={280}>
              <BarChart data={engagementData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="Engagement" fill="#10B981" radius={[8, 8, 0, 0]} />
                <Bar dataKey="Completion" fill="#3B82F6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="rounded-2xl bg-white border border-slate-200 p-5">
          <h2 className="font-display font-bold text-xl mb-3">Smart Alerts</h2>
          <div className="space-y-3 text-sm">
            <div className="rounded-xl bg-yellow-50 border border-yellow-200 p-3">
              <p className="font-semibold text-yellow-800">Weak Topic</p>
              <p className="text-yellow-700 mt-1">
                {weakestClass ? `Class ${weakestClass.className} struggling in` : "Students struggle in"}{" "}
                <strong>{weakTopic}</strong>.
              </p>
            </div>
            <div className="rounded-xl bg-red-50 border border-red-200 p-3">
              <p className="font-semibold text-red-800 flex items-center gap-1">
                <ShieldAlert className="w-4 h-4" /> Inactive Students
              </p>
              <p className="text-red-700 mt-1">{inactiveStudents.length} students need re-engagement.</p>
            </div>
          </div>
        </article>
      </section>

      <section className="grid xl:grid-cols-3 gap-4">
        <article className="xl:col-span-2 rounded-2xl bg-white border border-slate-200 p-5">
          <h2 className="font-display font-bold text-xl mb-3">Class Leaderboard</h2>
          <div className="space-y-2">
            {classLeaderboard.map((c) => (
              <div key={c.className} className="rounded-xl border border-slate-200 px-3 py-2 flex justify-between">
                <span className="font-semibold">#{c.rank} {c.className}</span>
                <span className="text-sm text-slate-600">
                  Avg XP {c.avgXP} • {c.students} students • {c.engagement}% engagement
                </span>
              </div>
            ))}
          </div>
        </article>
        <article className="rounded-2xl bg-white border border-slate-200 p-5">
          <h2 className="font-display font-bold text-xl mb-3">Top Teachers</h2>
          <div className="space-y-2">
            {teacherLeaderboard.map((t, i) => (
              <div key={t.name || i} className="rounded-xl border border-slate-200 px-3 py-2 flex justify-between">
                <span className="font-semibold">#{i + 1} {t.name}</span>
                <span className="text-emerald-700 font-bold">{t.score}</span>
              </div>
            ))}
            {teacherLeaderboard.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">
                No teacher leaderboard data yet.
              </div>
            ) : null}
          </div>
        </article>
        
        <article className="rounded-2xl bg-white border border-slate-200 p-5">
          <h2 className="font-display font-bold text-xl mb-3 flex items-center gap-2">
            <Award className="w-5 h-5 text-purple-500" /> Active School Events
          </h2>
          <div className="space-y-3 overflow-y-auto max-h-64 no-scrollbar">
            {events.map((ev) => (
              <div key={ev._id} className="rounded-xl bg-gradient-to-r from-purple-50 to-fuchsia-50 border border-purple-100 p-3 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-1">
                  <p className="font-bold text-purple-900 leading-tight pr-2">{ev.title}</p>
                  <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-purple-200 text-purple-800 shrink-0">{ev.type}</span>
                </div>
                <p className="text-purple-700 text-xs font-semibold mt-1 opacity-80 uppercase tracking-wide">
                  Scope: {ev.scope || "school-wide"}
                </p>
              </div>
            ))}
            {events.length === 0 && (
              <div className="text-sm text-slate-500 text-center py-6 border border-dashed border-slate-200 rounded-xl">
                No active events from Principal.
              </div>
            )}
          </div>
        </article>
      </section>
    </TeacherShell>
  );
}

export default TeacherDashboard;