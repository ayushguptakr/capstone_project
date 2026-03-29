import React, { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import TeacherShell from "../components/TeacherShell";
import { fetchTeacherBootstrap } from "../api/teacherApi";

export default function TeacherAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  useEffect(() => {
    fetchTeacherBootstrap().then((d) => setAnalytics(d.analytics));
  }, []);

  const students = analytics?.students || [];
  const classRows = useMemo(() => {
    if (Array.isArray(analytics?.classMetrics) && analytics.classMetrics.length) return analytics.classMetrics;
    return [];
  }, [analytics]);
  const engagementData = classRows.map((c) => ({ name: c.className.slice(0, 10), Engagement: c.engagement, Completion: c.completion }));
  const xpDistribution = [
    { name: "0-200 XP", value: students.filter((s) => (s.points || 0) <= 200).length || 1 },
    { name: "201-600 XP", value: students.filter((s) => (s.points || 0) > 200 && (s.points || 0) <= 600).length || 1 },
    { name: "600+ XP", value: students.filter((s) => (s.points || 0) > 600).length || 1 },
  ];
  const trendData = [
    { week: "W1", engagement: 78, completion: 72 },
    { week: "W2", engagement: 82, completion: 76 },
    { week: "W3", engagement: 69, completion: 68 },
    { week: "W4", engagement: 74, completion: 73 },
  ];

  return (
    <TeacherShell title="Analytics" subtitle="Charts focused on engagement, completion, and XP distribution.">
      <section className="grid xl:grid-cols-3 gap-4">
        <article className="xl:col-span-2 rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="font-display font-bold text-xl mb-3">Engagement Trends</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Line dataKey="engagement" stroke="#10B981" strokeWidth={3} dot={{ r: 4 }} />
                <Line dataKey="completion" stroke="#3B82F6" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="font-display font-bold text-xl mb-3">XP Distribution</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={xpDistribution} dataKey="value" nameKey="name" outerRadius={92} label>
                  {xpDistribution.map((item, idx) => <Cell key={item.name} fill={["#10B981", "#3B82F6", "#F59E0B"][idx % 3]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </article>
      </section>
      <article className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="font-display font-bold text-xl mb-3">Class Engagement</h2>
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
    </TeacherShell>
  );
}
