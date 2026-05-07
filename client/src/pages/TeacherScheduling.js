import React, { useEffect, useState } from "react";
import { CalendarPlus } from "lucide-react";
import TeacherShell from "../components/TeacherShell";
import { createScheduleApi, fetchTeacherBootstrap } from "../api/teacherApi";
import { apiRequest } from "../api/httpClient";

export default function TeacherScheduling() {
  const [scheduleItems, setScheduleItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [pagination, setPagination] = useState({ total: 0, limit: 25, offset: 0, hasMore: false });
  const [form, setForm] = useState({
    type: "quiz",
    contentId: "",
    title: "",
    visibility: "students",
    startDate: "",
    endDate: "",
  });
  const [contentOptions, setContentOptions] = useState({ tasks: [], quizzes: [] });
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetchTeacherBootstrap().then((d) => {
      setScheduleItems(d.schedules || []);
      if (d.schedulesPagination) setPagination((p) => ({ ...p, ...d.schedulesPagination }));
      setContentOptions({
        tasks: Array.isArray(d.tasks) ? d.tasks : [],
        quizzes: Array.isArray(d.quizzes) ? d.quizzes : [],
      });
    });
  }, []);

  async function fetchPage(nextOffset) {
    const resp = await apiRequest(`/api/teacher/schedules?limit=${pagination.limit}&offset=${nextOffset}`);
    setScheduleItems(Array.isArray(resp) ? resp : resp?.items || []);
    setPagination((p) => ({ ...p, ...(resp?.pagination || {}) }));
  }

  async function createItem() {
    if (!form.title || !form.startDate) return;
    if (form.endDate && new Date(form.endDate) < new Date(form.startDate)) {
      setMsg("End date cannot be before start date.");
      setTimeout(() => setMsg(""), 1800);
      return;
    }
    const optimistic = { ...form, _id: `tmp-${Date.now()}`, isPending: true };
    setScheduleItems((p) => [optimistic, ...p]);
    setOpen(false);
    try {
      const created = await createScheduleApi(form);
      setScheduleItems((p) => [created, ...p.filter((x) => x._id !== optimistic._id)]);
      setForm({ type: "quiz", contentId: "", title: "", visibility: "students", startDate: "", endDate: "" });
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
        <div className="mb-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700">
          Scheduling currently works as a planner and timeline tracker. It does not yet auto-hide/auto-publish quizzes or tasks by date window.
        </div>
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
        {pagination.total > 0 ? (
          <div className="p-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>
              Showing {pagination.offset + 1}-{Math.min(pagination.offset + scheduleItems.length, pagination.total)} of {pagination.total}
            </span>
            <div className="flex gap-2">
              <button
                disabled={pagination.offset <= 0}
                onClick={() => fetchPage(Math.max(0, pagination.offset - pagination.limit))}
                className="px-2 py-1 rounded border border-slate-200 disabled:opacity-40"
              >
                Prev
              </button>
              <button
                disabled={!pagination.hasMore}
                onClick={() => fetchPage(pagination.offset + pagination.limit)}
                className="px-2 py-1 rounded border border-slate-200 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        ) : null}
      </div>

      {open ? (
        <div className="fixed inset-0 z-50 bg-black/40 p-4 flex items-center justify-center" onClick={() => setOpen(false)}>
          <div className="w-full max-w-lg rounded-2xl bg-white p-5" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-display font-bold text-xl mb-3">Create Schedule</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              <select
                value={form.type}
                onChange={(e) => setForm((p) => ({ ...p, type: e.target.value, contentId: "", title: "" }))}
                className="rounded-xl border border-slate-200 px-3 py-2"
              >
                <option value="quiz">Quiz</option>
                <option value="task">Task</option>
              </select>
              <select
                value={form.contentId}
                onChange={(e) => {
                  const list = form.type === "task" ? contentOptions.tasks : contentOptions.quizzes;
                  const selected = list.find((c) => String(c._id) === String(e.target.value));
                  setForm((p) => ({
                    ...p,
                    contentId: e.target.value,
                    title: selected?.title || "",
                  }));
                }}
                className="rounded-xl border border-slate-200 px-3 py-2"
              >
                <option value="">Select {form.type}</option>
                {(form.type === "task" ? contentOptions.tasks : contentOptions.quizzes).map((item) => (
                  <option key={item._id} value={item._id}>
                    {item.title}
                  </option>
                ))}
              </select>
              <input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} placeholder="Or enter title manually" className="rounded-xl border border-slate-200 px-3 py-2 sm:col-span-2" />
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
