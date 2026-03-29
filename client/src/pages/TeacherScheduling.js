import React, { useEffect, useState } from "react";
import { CalendarPlus } from "lucide-react";
import TeacherShell from "../components/TeacherShell";
import { createScheduleApi, fetchTeacherBootstrap } from "../api/teacherApi";

export default function TeacherScheduling() {
  const [scheduleItems, setScheduleItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    type: "quiz",
    title: "",
    visibility: "students",
    startDate: "",
    endDate: "",
  });
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetchTeacherBootstrap().then((d) => setScheduleItems(d.schedules || []));
  }, []);

  async function createItem() {
    if (!form.title || !form.startDate) return;
    const optimistic = { ...form, _id: `tmp-${Date.now()}`, isPending: true };
    setScheduleItems((p) => [optimistic, ...p]);
    setOpen(false);
    try {
      const created = await createScheduleApi(form);
      setScheduleItems((p) => [created, ...p.filter((x) => x._id !== optimistic._id)]);
      setForm({ type: "quiz", title: "", visibility: "students", startDate: "", endDate: "" });
      setMsg("Content scheduled.");
    } catch (e) {
      setScheduleItems((p) => p.filter((x) => x._id !== optimistic._id));
      setMsg(e.message || "Schedule failed.");
    } finally {
      setTimeout(() => setMsg(""), 1800);
    }
  }

  return (
    <TeacherShell title="Scheduling" subtitle="Plan quiz and task releases with start/end visibility windows.">
      {msg ? <div className="rounded-xl border border-slate-200 bg-white p-3 text-sm">{msg}</div> : null}
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <button onClick={() => setOpen(true)} className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold inline-flex items-center gap-2">
          <CalendarPlus className="w-4 h-4" /> New Schedule
        </button>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="text-left p-3">Title</th>
              <th className="text-left p-3">Type</th>
              <th className="text-left p-3">Window</th>
              <th className="text-left p-3">Visibility</th>
            </tr>
          </thead>
          <tbody>
            {scheduleItems.map((s) => (
              <tr key={s._id} className="border-t border-slate-100">
                <td className="p-3 font-semibold">{s.title}</td>
                <td className="p-3 capitalize">{s.type}</td>
                <td className="p-3">
                  {new Date(s.startDate).toLocaleDateString()} - {s.endDate ? new Date(s.endDate).toLocaleDateString() : "N/A"}
                </td>
                <td className="p-3">{s.visibility}{s.isPending ? " (syncing...)" : ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {scheduleItems.length === 0 ? <div className="p-8 text-center text-slate-500">No scheduled items yet.</div> : null}
      </div>

      {open ? (
        <div className="fixed inset-0 z-50 bg-black/40 p-4 flex items-center justify-center" onClick={() => setOpen(false)}>
          <div className="w-full max-w-lg rounded-2xl bg-white p-5" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-display font-bold text-xl mb-3">Create Schedule</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              <select value={form.type} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))} className="rounded-xl border border-slate-200 px-3 py-2">
                <option value="quiz">Quiz</option>
                <option value="task">Task</option>
              </select>
              <input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} placeholder="Title" className="rounded-xl border border-slate-200 px-3 py-2" />
              <input type="date" value={form.startDate} onChange={(e) => setForm((p) => ({ ...p, startDate: e.target.value }))} className="rounded-xl border border-slate-200 px-3 py-2" />
              <input type="date" value={form.endDate} onChange={(e) => setForm((p) => ({ ...p, endDate: e.target.value }))} className="rounded-xl border border-slate-200 px-3 py-2" />
              <select value={form.visibility} onChange={(e) => setForm((p) => ({ ...p, visibility: e.target.value }))} className="rounded-xl border border-slate-200 px-3 py-2 sm:col-span-2">
                <option value="students">Visible to Students</option>
                <option value="teachers">Teacher-only Draft</option>
              </select>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button className="px-3 py-2 rounded-xl border border-slate-200" onClick={() => setOpen(false)}>Cancel</button>
              <button className="px-3 py-2 rounded-xl bg-indigo-600 text-white" onClick={createItem}>Save</button>
            </div>
          </div>
        </div>
      ) : null}
    </TeacherShell>
  );
}
