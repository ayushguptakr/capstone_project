import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ShieldAlert, Trophy, Users, ClipboardCheck } from "lucide-react";
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

function TeacherDashboard() {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [verificationQueue, setVerificationQueue] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchTeacherBootstrap();
        setAnalytics(data.analytics);
        setVerificationQueue(data.verificationQueue);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const students = analytics?.students || [];
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
        <article className="xl:col-span-2 rounded-2xl bg-white border border-slate-200 p-5">
          <h2 className="font-display font-bold text-xl mb-3">Insights</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
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
      </section>
    </TeacherShell>
  );
}

export default TeacherDashboard;