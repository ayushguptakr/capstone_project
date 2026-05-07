import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import TeacherShell from "../components/TeacherShell";
import { fetchTeacherBootstrap } from "../api/teacherApi";

export default function TeacherClasses() {
  const [analytics, setAnalytics] = useState(null);
  const [search, setSearch] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const [sectionFilter, setSectionFilter] = useState("all");
  const navigate = useNavigate();

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

  const classOptions = useMemo(() => {
    const values = new Set(
      (analytics?.students || [])
        .map((s) => String(s.class || s.className || "").trim())
        .filter(Boolean)
    );
    return [...values].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  }, [analytics]);

  const sectionOptions = useMemo(() => {
    const values = new Set(
      (analytics?.students || [])
        .map((s) => String(s.section || "").trim())
        .filter(Boolean)
    );
    return [...values].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  }, [analytics]);

  const rows = classRows.filter((c) => {
    const className = String(c.className || "");
    const passesSearch = className.toLowerCase().includes(search.toLowerCase());
    const passesClass = classFilter === "all" || className.startsWith(String(classFilter));
    const passesSection = sectionFilter === "all" || className.endsWith(String(sectionFilter));
    return passesSearch && passesClass && passesSection;
  });

  const studentsInSelected = useMemo(() => {
    if (!selectedClass) return [];
    return (analytics?.students || []).filter((s) => classKey(s) === selectedClass);
  }, [analytics, selectedClass]);

  return (
    <TeacherShell title="Classes" subtitle="Class-level competition and performance overview." onSearch={setSearch}>
      <div className="rounded-2xl border border-white/70 bg-white/80 backdrop-blur p-4 shadow-sm">
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Class</label>
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2"
            >
              <option value="all">All Classes</option>
              {classOptions.map((cls) => (
                <option key={cls} value={cls}>
                  {cls}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Section</label>
            <select
              value={sectionFilter}
              onChange={(e) => setSectionFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2"
            >
              <option value="all">All Sections</option>
              {sectionOptions.map((sec) => (
                <option key={sec} value={sec}>
                  {sec}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      <div className="grid xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 rounded-2xl border border-white/70 bg-white/90 backdrop-blur overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-gradient-to-r from-emerald-50 to-cyan-50 text-slate-700">
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
                  className={`border-t border-slate-100 hover:bg-emerald-50/40 cursor-pointer transition ${selectedClass === c.className ? "bg-emerald-50/70" : ""}`}
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
        <div className="rounded-2xl border border-white/70 bg-white/90 backdrop-blur p-4 shadow-sm">
          <h3 className="font-display font-bold text-lg">
            {selectedClass ? `Students in ${selectedClass}` : "Select a class"}
          </h3>
          <div className="mt-3 space-y-2 max-h-[420px] overflow-auto">
            {studentsInSelected.map((s) => (
              <button
                key={s._id}
                onClick={() =>
                  navigate(
                    `/teacher/students?class=${encodeURIComponent(s.class || s.className || "")}&section=${encodeURIComponent(s.section || "")}&studentId=${encodeURIComponent(s._id)}`
                  )
                }
                className="w-full text-left rounded-xl border border-slate-200 p-3 hover:bg-slate-50 transition"
              >
                <p className="font-semibold">{s.name}</p>
                <p className="text-xs text-slate-500">
                  XP {s.points || 0} • Lvl {s.level || Math.max(1, Math.floor((s.points || 0) / 100) + 1)}
                </p>
              </button>
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
