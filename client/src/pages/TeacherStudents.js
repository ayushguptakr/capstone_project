import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Info } from "lucide-react";
import TeacherShell from "../components/TeacherShell";
import { assignBonusXpApi, createCustomBadgeApi, fetchTeacherBootstrap } from "../api/teacherApi";

export default function TeacherStudents() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const [sectionFilter, setSectionFilter] = useState("all");
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [xpForm, setXpForm] = useState({ studentId: "", points: 15, reason: "" });
  const [badgeForm, setBadgeForm] = useState({ title: "", icon: "🌟", criteria: "" });
  const [msg, setMsg] = useState("");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetchTeacherBootstrap().then((d) => {
      const list = d.analytics?.students || [];
      setStudents(list);
      const classParam = searchParams.get("class");
      const sectionParam = searchParams.get("section");
      const studentIdParam = searchParams.get("studentId");
      if (classParam) setClassFilter(classParam);
      if (sectionParam) setSectionFilter(sectionParam);
      if (studentIdParam) setSelectedStudentId(studentIdParam);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const classOptions = useMemo(() => {
    const values = new Set(
      students
        .map((s) => String(s.class || s.className || "").trim())
        .filter(Boolean)
    );
    return [...values].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  }, [students]);

  const sectionOptions = useMemo(() => {
    const values = new Set(
      students
        .map((s) => String(s.section || "").trim())
        .filter(Boolean)
    );
    return [...values].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  }, [students]);

  const filtered = useMemo(
    () =>
      students.filter((s) => {
        const classSection = `${s.class || s.className || ""}${s.section || ""}`;
        const passesClass = classFilter === "all" || String(s.class || s.className || "") === classFilter;
        const passesSection = sectionFilter === "all" || String(s.section || "") === sectionFilter;
        const matchesSearch =
          (s.name || "").toLowerCase().includes(search.toLowerCase()) ||
          classSection.toLowerCase().includes(search.toLowerCase());
        return passesClass && passesSection && matchesSearch;
      }),
    [students, search, classFilter, sectionFilter]
  );

  const selectedStudent = useMemo(
    () => students.find((s) => String(s._id) === String(selectedStudentId)) || null,
    [students, selectedStudentId]
  );

  async function assignXp() {
    if (!xpForm.studentId || Number(xpForm.points) <= 0) return;
    const delta = Number(xpForm.points);
    const prev = students;
    setStudents((p) => p.map((s) => (s._id === xpForm.studentId ? { ...s, points: Number(s.points || 0) + delta } : s)));
    try {
      await assignBonusXpApi(xpForm);
      setMsg("Bonus XP assigned.");
      setXpForm({ studentId: "", points: 15, reason: "" });
    } catch (e) {
      setStudents(prev);
      setMsg(e.message || "Failed to assign XP.");
    } finally {
      setTimeout(() => setMsg(""), 1800);
    }
  }

  async function createBadge() {
    if (!badgeForm.title.trim()) return;
    try {
      await createCustomBadgeApi(badgeForm);
      setMsg("Custom badge created.");
      setBadgeForm({ title: "", icon: "🌟", criteria: "" });
    } catch (e) {
      setMsg(e.message || "Failed to create badge.");
    } finally {
      setTimeout(() => setMsg(""), 1800);
    }
  }

  return (
    <TeacherShell title="Students" subtitle="Search students, review progress, and assign rewards." onSearch={setSearch}>
      {msg ? <div className="rounded-xl border border-slate-200 bg-white p-3 text-sm">{msg}</div> : null}
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
                <th className="text-left p-3">Student</th>
                <th className="text-left p-3">Class</th>
                <th className="text-left p-3">XP</th>
                <th className="text-left p-3">Level</th>
                <th className="text-left p-3">Badges</th>
                <th className="text-left p-3">Info</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s._id} className="border-t border-slate-100 hover:bg-emerald-50/40 transition">
                  <td className="p-3 font-semibold">{s.name}</td>
                  <td className="p-3">{`${s.class || s.className || "N/A"}${s.section || ""}`}</td>
                  <td className="p-3">{s.points || 0}</td>
                  <td className="p-3">{Math.max(1, Math.floor((s.points || 0) / 100) + 1)}</td>
                  <td className="p-3">{s.badges?.length || 0}</td>
                  <td className="p-3">
                    <button
                      onClick={() => setSelectedStudentId(s._id)}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-1 text-xs font-semibold hover:bg-slate-100"
                      title="View student details"
                    >
                      <Info className="w-3.5 h-3.5" />
                      Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 ? <div className="p-8 text-center text-slate-500">No students found.</div> : null}
        </div>
        <div className="space-y-4">
          <div className="rounded-2xl border border-white/70 bg-white/90 backdrop-blur p-4 shadow-sm">
            <h3 className="font-display font-bold mb-2">Student Details</h3>
            {selectedStudent ? (
              <div className="text-sm text-slate-700 space-y-1">
                <p><span className="font-semibold">Name:</span> {selectedStudent.name}</p>
                <p><span className="font-semibold">Email:</span> {selectedStudent.email || "N/A"}</p>
                <p>
                  <span className="font-semibold">Class:</span>{" "}
                  {`${selectedStudent.class || selectedStudent.className || "N/A"}${selectedStudent.section || ""}`}
                </p>
                <p><span className="font-semibold">XP:</span> {selectedStudent.points || 0}</p>
                <p><span className="font-semibold">Level:</span> {selectedStudent.level || Math.max(1, Math.floor((selectedStudent.points || 0) / 100) + 1)}</p>
                <p><span className="font-semibold">Badges:</span> {selectedStudent.badges?.length || 0}</p>
                <button
                  onClick={() => navigate(`/teacher/students/${selectedStudent._id}`)}
                  className="mt-2 w-full rounded-xl bg-emerald-600 text-white py-2 font-semibold hover:bg-emerald-700 transition"
                >
                  Open Full Profile
                </button>
              </div>
            ) : (
              <p className="text-sm text-slate-500">Click the info button in student list to view details.</p>
            )}
          </div>
          <div className="rounded-2xl border border-white/70 bg-white/90 backdrop-blur p-4 shadow-sm">
            <h3 className="font-display font-bold mb-3">Assign Bonus XP</h3>
            <div className="space-y-2">
              <select value={xpForm.studentId} onChange={(e) => setXpForm((p) => ({ ...p, studentId: e.target.value }))} className="w-full rounded-xl border border-slate-200 px-3 py-2">
                <option value="">Select student</option>
                {students.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select>
              <input type="number" value={xpForm.points} onChange={(e) => setXpForm((p) => ({ ...p, points: Number(e.target.value) }))} className="w-full rounded-xl border border-slate-200 px-3 py-2" />
              <input value={xpForm.reason} onChange={(e) => setXpForm((p) => ({ ...p, reason: e.target.value }))} placeholder="Reason" className="w-full rounded-xl border border-slate-200 px-3 py-2" />
              <button onClick={assignXp} className="w-full rounded-xl bg-violet-600 text-white py-2 font-semibold">Assign XP</button>
            </div>
          </div>
          <div className="rounded-2xl border border-white/70 bg-white/90 backdrop-blur p-4 shadow-sm">
            <h3 className="font-display font-bold mb-3">Create Badge</h3>
            <div className="space-y-2">
              <input value={badgeForm.title} onChange={(e) => setBadgeForm((p) => ({ ...p, title: e.target.value }))} placeholder="Badge title" className="w-full rounded-xl border border-slate-200 px-3 py-2" />
              <input value={badgeForm.icon} onChange={(e) => setBadgeForm((p) => ({ ...p, icon: e.target.value }))} placeholder="Icon" className="w-full rounded-xl border border-slate-200 px-3 py-2" />
              <input value={badgeForm.criteria} onChange={(e) => setBadgeForm((p) => ({ ...p, criteria: e.target.value }))} placeholder="Criteria" className="w-full rounded-xl border border-slate-200 px-3 py-2" />
              <button onClick={createBadge} className="w-full rounded-xl bg-amber-600 text-white py-2 font-semibold">Create Badge</button>
            </div>
          </div>
        </div>
      </div>
    </TeacherShell>
  );
}
