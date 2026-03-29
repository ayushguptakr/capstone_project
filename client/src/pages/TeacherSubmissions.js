import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ShieldAlert } from "lucide-react";
import TeacherShell from "../components/TeacherShell";
import { fetchTeacherBootstrap, verifySubmissionApi } from "../api/teacherApi";

function flagLabel(flag) {
  if (flag === "duplicate_image") return "Duplicate image";
  if (flag === "repeated_content") return "Repeated content";
  if (flag === "low_detail") return "Low detail";
  if (flag === "tiny_file") return "Tiny file";
  return flag;
}

export default function TeacherSubmissions() {
  const [queue, setQueue] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("pending");
  const [feedback, setFeedback] = useState({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchTeacherBootstrap()
      .then((d) => setQueue(d.verificationQueue || []))
      .finally(() => setLoading(false));
  }, []);

  const rows = useMemo(() => {
    const q = search.toLowerCase();
    return queue.filter((s) => {
      const classSection = `${s?.student?.class || s?.student?.className || ""}${s?.student?.section || ""}`;
      const matches =
        (s?.student?.name || "").toLowerCase().includes(q) ||
        (s?.task?.title || "").toLowerCase().includes(q) ||
        classSection.toLowerCase().includes(q);
      if (statusFilter === "pending") return matches;
      if (statusFilter === "approved") return matches && s.status === "approved";
      if (statusFilter === "rejected") return matches && s.status === "rejected";
      return matches;
    });
  }, [queue, search, statusFilter]);

  async function decide(id, status) {
    const prev = queue;
    setQueue((p) => p.filter((x) => x._id !== id));
    try {
      await verifySubmissionApi(id, { status, feedback: feedback[id] || "" });
      setMessage(`Submission ${status}.`);
      setTimeout(() => setMessage(""), 1500);
    } catch (e) {
      setQueue(prev);
      setMessage(e.message || "Action failed");
      setTimeout(() => setMessage(""), 2000);
    }
  }

  return (
    <TeacherShell title="Submissions" subtitle="Review, filter, and verify student submissions." onSearch={setSearch}>
      {message ? <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-2 text-sm">{message}</div> : null}

      <div className="rounded-2xl border border-slate-200 bg-white p-4 flex flex-wrap gap-2">
        {["pending", "approved", "rejected"].map((f) => (
          <button
            key={f}
            onClick={() => setStatusFilter(f)}
            className={`px-3 py-1.5 rounded-xl text-sm font-semibold ${
              statusFilter === f ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-700"
            }`}
          >
            {f[0].toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="text-left p-3">Student</th>
                <th className="text-left p-3">Task</th>
                <th className="text-left p-3">Flags</th>
                <th className="text-left p-3">Feedback</th>
                <th className="text-left p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {!loading &&
                rows.map((s) => (
                  <motion.tr key={s._id} whileHover={{ backgroundColor: "#f8fafc" }} className="border-t border-slate-100">
                    <td className="p-3 font-semibold">
                      {s?.student?.name || "N/A"}
                      <p className="text-xs text-slate-500 font-normal mt-0.5">
                        {`${s?.student?.class || s?.student?.className || "Class N/A"}${s?.student?.section || ""}`}
                      </p>
                    </td>
                    <td className="p-3">{s?.task?.title || "Task"}</td>
                    <td className="p-3">
                      {Array.isArray(s.autoFlags) && s.autoFlags.length ? (
                        <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-red-100 text-red-700">
                          <ShieldAlert className="w-3.5 h-3.5" />
                          {s.autoFlags.map(flagLabel).join(", ")}
                        </span>
                      ) : (
                        <span className="text-slate-400">None</span>
                      )}
                    </td>
                    <td className="p-3 min-w-[220px]">
                      <input
                        value={feedback[s._id] || ""}
                        onChange={(e) => setFeedback((p) => ({ ...p, [s._id]: e.target.value }))}
                        className="w-full rounded-lg border border-slate-200 px-2 py-1"
                        placeholder="Feedback"
                      />
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <button onClick={() => decide(s._id, "approved")} className="px-2 py-1 rounded bg-emerald-600 text-white">Approve</button>
                        <button onClick={() => decide(s._id, "rejected")} className="px-2 py-1 rounded bg-red-600 text-white">Reject</button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
            </tbody>
          </table>
        </div>
        {!loading && rows.length === 0 ? (
          <div className="p-8 text-center text-slate-500">No submissions match this filter.</div>
        ) : null}
      </div>
    </TeacherShell>
  );
}
