import React, { useEffect, useState } from "react";
import TeacherShell from "../components/TeacherShell";
import { createAnnouncementApi, fetchTeacherBootstrap } from "../api/teacherApi";

export default function TeacherAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [target, setTarget] = useState("All Classes");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    fetchTeacherBootstrap().then((d) => setAnnouncements(d.announcements || []));
  }, []);

  async function send() {
    if (!message.trim()) return;
    const optimistic = { _id: `tmp-${Date.now()}`, target, message, createdAt: new Date().toISOString(), isPending: true };
    setAnnouncements((p) => [optimistic, ...p]);
    setMessage("");
    try {
      const created = await createAnnouncementApi({ target, message });
      setAnnouncements((p) => [created, ...p.filter((x) => x._id !== optimistic._id)]);
      setStatus("Announcement sent.");
    } catch (e) {
      setAnnouncements((p) => p.filter((x) => x._id !== optimistic._id));
      setStatus(e.message || "Failed to send.");
    } finally {
      setTimeout(() => setStatus(""), 2000);
    }
  }

  return (
    <TeacherShell title="Announcements" subtitle="Broadcast updates with clear delivery history.">
      {status ? <div className="rounded-xl border border-slate-200 bg-white p-3 text-sm">{status}</div> : null}
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="grid sm:grid-cols-4 gap-2">
          <select value={target} onChange={(e) => setTarget(e.target.value)} className="rounded-xl border border-slate-200 px-3 py-2">
            <option>All Classes</option>
          </select>
          <input value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Announcement message" className="sm:col-span-2 rounded-xl border border-slate-200 px-3 py-2" />
          <button onClick={send} className="rounded-xl bg-emerald-600 text-white font-semibold">Send</button>
        </div>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50"><tr><th className="p-3 text-left">Target</th><th className="p-3 text-left">Message</th><th className="p-3 text-left">Date</th></tr></thead>
          <tbody>
            {announcements.map((a) => (
              <tr key={a._id} className="border-t border-slate-100">
                <td className="p-3 font-semibold">{a.target}</td>
                <td className="p-3">{a.message}{a.isPending ? " (sending...)" : ""}</td>
                <td className="p-3">{new Date(a.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {announcements.length === 0 ? <div className="p-8 text-center text-slate-500">No announcements yet.</div> : null}
      </div>
    </TeacherShell>
  );
}
