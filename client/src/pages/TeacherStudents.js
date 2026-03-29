import React, { useEffect, useMemo, useState } from "react";
import TeacherShell from "../components/TeacherShell";
import { assignBonusXpApi, createCustomBadgeApi, fetchTeacherBootstrap } from "../api/teacherApi";

export default function TeacherStudents() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [xpForm, setXpForm] = useState({ studentId: "", points: 15, reason: "" });
  const [badgeForm, setBadgeForm] = useState({ title: "", icon: "🌟", criteria: "" });
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetchTeacherBootstrap().then((d) => setStudents(d.analytics?.students || []));
  }, []);

  const filtered = useMemo(
    () =>
      students.filter((s) => {
        const classSection = `${s.class || s.className || ""}${s.section || ""}`;
        return (
          (s.name || "").toLowerCase().includes(search.toLowerCase()) ||
          classSection.toLowerCase().includes(search.toLowerCase())
        );
      }),
    [students, search]
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
      <div className="grid xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 rounded-2xl border border-slate-200 bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="text-left p-3">Student</th>
                <th className="text-left p-3">Class</th>
                <th className="text-left p-3">XP</th>
                <th className="text-left p-3">Level</th>
                <th className="text-left p-3">Badges</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s._id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="p-3 font-semibold">{s.name}</td>
                  <td className="p-3">{`${s.class || s.className || "N/A"}${s.section || ""}`}</td>
                  <td className="p-3">{s.points || 0}</td>
                  <td className="p-3">{Math.max(1, Math.floor((s.points || 0) / 100) + 1)}</td>
                  <td className="p-3">{s.badges?.length || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 ? <div className="p-8 text-center text-slate-500">No students found.</div> : null}
        </div>
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
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
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
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
