import React, { useEffect, useMemo, useState } from "react";
import TeacherShell from "../components/TeacherShell";
import { fetchTeacherBootstrap } from "../api/teacherApi";

export default function TeacherClasses() {
  const [analytics, setAnalytics] = useState(null);
  const [search, setSearch] = useState("");
  const [selectedClass, setSelectedClass] = useState("");

  useEffect(() => {
    fetchTeacherBootstrap().then((d) => setAnalytics(d.analytics || null));
  }, []);

  const classKey = (s) => {
    const cls = s.class || s.className || "Class";
    const sec = s.section || "";
    return `${cls}${sec}`.trim();
  };

  const classRows = useMemo(() => {
    if (Array.isArray(analytics?.classMetrics) && analytics.classMetrics.length) return analytics.classMetrics;
    return [];
  }, [analytics]);

  const rows = classRows.filter((c) => c.className.toLowerCase().includes(search.toLowerCase()));
  const studentsInSelected = useMemo(() => {
    if (!selectedClass) return [];
    return (analytics?.students || []).filter((s) => classKey(s) === selectedClass);
  }, [analytics, selectedClass]);

  return (
    <TeacherShell title="Classes" subtitle="Class-level competition and performance overview." onSearch={setSearch}>
      <div className="grid xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 rounded-2xl border border-slate-200 bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="text-left p-3">Class</th>
                <th className="text-left p-3">Students</th>
                <th className="text-left p-3">Avg XP</th>
                <th className="text-left p-3">Engagement</th>
                <th className="text-left p-3">Completion</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => (
                <tr
                  key={c.className}
                  className={`border-t border-slate-100 hover:bg-slate-50 cursor-pointer ${selectedClass === c.className ? "bg-emerald-50/60" : ""}`}
                  onClick={() => setSelectedClass(c.className)}
                >
                  <td className="p-3 font-semibold">{c.className}</td>
                  <td className="p-3">{c.students}</td>
                  <td className="p-3">{c.avgXP}</td>
                  <td className="p-3">{c.engagement}%</td>
                  <td className="p-3">{c.completion}%</td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 ? <div className="p-8 text-center text-slate-500">No class data available.</div> : null}
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <h3 className="font-display font-bold text-lg">
            {selectedClass ? `Students in ${selectedClass}` : "Select a class"}
          </h3>
          <div className="mt-3 space-y-2 max-h-[420px] overflow-auto">
            {studentsInSelected.map((s) => (
              <div key={s._id} className="rounded-xl border border-slate-200 p-3">
                <p className="font-semibold">{s.name}</p>
                <p className="text-xs text-slate-500">
                  XP {s.points || 0} • Lvl {s.level || Math.max(1, Math.floor((s.points || 0) / 100) + 1)}
                </p>
              </div>
            ))}
            {selectedClass && studentsInSelected.length === 0 ? (
              <p className="text-sm text-slate-500">No students mapped to this class yet.</p>
            ) : null}
          </div>
        </div>
      </div>
    </TeacherShell>
  );
}
