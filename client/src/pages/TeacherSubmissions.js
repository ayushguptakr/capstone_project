import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ShieldAlert, Image as ImageIcon, X, PlayCircle, Eye } from "lucide-react";
import TeacherShell from "../components/TeacherShell";
import { fetchTeacherBootstrap, verifySubmissionApi } from "../api/teacherApi";
import { API_BASE_URL } from "../api/httpClient";

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
  const [previewSub, setPreviewSub] = useState(null);

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
      {/* Media Preview Modal */}
      {previewSub && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="p-4 flex items-center justify-between border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 rounded-xl">
                  <Eye className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">{previewSub.task?.title || "Proof"}</h3>
                  <p className="text-sm font-medium text-slate-500">Submitted by {previewSub.student?.name}</p>
                </div>
              </div>
              <button onClick={() => setPreviewSub(null)} className="p-2 hover:bg-slate-200 rounded-full transition">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto bg-slate-50 flex flex-col items-center">
              {previewSub.imageUrl ? (
                previewSub.fileMime?.startsWith("video") || previewSub.imageUrl.match(/\.(mp4|webm|ogg)$/i) ? (
                  <video src={previewSub.imageUrl.startsWith("http") ? previewSub.imageUrl : `${API_BASE_URL}${previewSub.imageUrl}`} controls className="w-full max-h-[500px] rounded-2xl shadow-sm bg-black" />
                ) : (
                  <img src={previewSub.imageUrl.startsWith("http") ? previewSub.imageUrl : `${API_BASE_URL}${previewSub.imageUrl}`} alt="Proof" className="w-full max-h-[500px] object-contain rounded-2xl shadow-sm bg-black/5" />
                )
              ) : (
                <div className="py-12 text-center text-slate-400 font-medium">No media uploaded</div>
              )}
              
              {previewSub.content && (
                <div className="w-full mt-4 p-4 bg-white border border-slate-200 rounded-2xl shadow-sm text-slate-700">
                  <span className="font-bold text-sm block text-slate-400 mb-1">Student's Note:</span>
                  <p className="whitespace-pre-wrap">{previewSub.content}</p>
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-slate-100 bg-white flex justify-end gap-3">
              <button onClick={() => { decide(previewSub._id, "rejected"); setPreviewSub(null); }} className="px-5 py-2.5 rounded-xl font-bold bg-white border-2 border-slate-200 text-slate-600 hover:bg-slate-50 transition">Reject</button>
              <button onClick={() => { decide(previewSub._id, "approved"); setPreviewSub(null); }} className="px-5 py-2.5 rounded-xl font-bold bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 transition">Approve Mission</button>
            </div>
          </motion.div>
        </div>
      )}

      {message ? <div className="mb-4 rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-2 text-sm">{message}</div> : null}

      <div className="rounded-2xl border border-slate-200 bg-white p-4 flex flex-wrap gap-2 mb-4">
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
                      <div className="flex gap-2 flex-wrap min-w-[200px]">
                        {(s.imageUrl || s.content) && (
                          <button onClick={() => setPreviewSub(s)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 font-bold hover:bg-blue-100 transition shadow-sm border border-blue-200">
                            {s.fileMime?.startsWith("video") ? <PlayCircle className="w-3.5 h-3.5" /> : <ImageIcon className="w-3.5 h-3.5" />}
                            Preview
                          </button>
                        )}
                        <button onClick={() => decide(s._id, "approved")} className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 font-bold text-white shadow-sm">Approve</button>
                        <button onClick={() => decide(s._id, "rejected")} className="px-3 py-1.5 rounded-lg bg-white border-2 border-slate-200 text-slate-600 font-bold hover:bg-slate-50">Reject</button>
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
