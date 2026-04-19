import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ShieldAlert, Image as ImageIcon, X, PlayCircle, Eye, Clock, Pencil, Check, Sparkles } from "lucide-react";
import TeacherShell from "../components/TeacherShell";
import { verifySubmissionApi } from "../api/teacherApi";
import { apiRequest, API_BASE_URL } from "../api/httpClient";

function flagLabel(flag) {
  if (flag === "duplicate_image") return "Duplicate image";
  if (flag === "repeated_content") return "Repeated content";
  if (flag === "low_detail") return "Low detail";
  if (flag === "tiny_file") return "Tiny file";
  return flag;
}

function StatusBadge({ status }) {
  const map = {
    approved: "bg-emerald-100 text-emerald-700 border-emerald-200",
    rejected: "bg-rose-100 text-rose-700 border-rose-200",
    pending: "bg-amber-100 text-amber-700 border-amber-200",
    resubmitted: "bg-blue-100 text-blue-700 border-blue-200",
  };
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${map[status] || map.pending}`}>
      {status ? status[0].toUpperCase() + status.slice(1) : "Pending"}
    </span>
  );
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function getLastFeedback(s) {
  if (Array.isArray(s.feedbackHistory) && s.feedbackHistory.length > 0) {
    return s.feedbackHistory[s.feedbackHistory.length - 1];
  }
  return null;
}

export default function TeacherSubmissions() {
  const [queue, setQueue] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("pending");
  const [feedback, setFeedback] = useState({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [previewSub, setPreviewSub] = useState(null);
  const [editingFeedback, setEditingFeedback] = useState({});

  async function fetchSubmissions(status) {
    setLoading(true);
    try {
      const data = await apiRequest(`/api/teacher/verification-queue?status=${status}`);
      setQueue(data || []);
    } catch (e) {
      console.error("Failed to fetch submissions:", e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setEditingFeedback({});
    setFeedback({});
    fetchSubmissions(statusFilter);
  }, [statusFilter]);

  const rows = useMemo(() => {
    const q = search.toLowerCase();
    return queue.filter((s) => {
      const classSection = `${s?.student?.class || s?.student?.className || ""}${s?.student?.section || ""}`;
      return (
        (s?.student?.name || "").toLowerCase().includes(q) ||
        (s?.task?.title || "").toLowerCase().includes(q) ||
        classSection.toLowerCase().includes(q)
      );
    });
  }, [queue, search]);

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

  async function updateFeedbackOnly(id) {
    try {
      await verifySubmissionApi(id, { status: statusFilter, feedback: feedback[id] || "" });
      setEditingFeedback(p => ({ ...p, [id]: false }));
      setMessage("Feedback updated.");
      setTimeout(() => setMessage(""), 1500);
      fetchSubmissions(statusFilter);
    } catch (e) {
      setMessage(e.message || "Failed to update feedback");
      setTimeout(() => setMessage(""), 2000);
    }
  }

  const [aiDrafting, setAiDrafting] = useState({});

  async function generateAIFeedback(sub) {
    setAiDrafting(p => ({ ...p, [sub._id]: true }));
    try {
      const resp = await apiRequest("/api/teacher/draft-feedback", {
        method: "POST",
        body: {
          taskTitle: sub?.task?.title || "Task",
          taskDescription: sub?.task?.description || "",
          studentText: sub.content || "",
          submissionType: sub.imageUrl ? "image" : "text"
        }
      });
      setFeedback(p => ({ ...p, [sub._id]: resp.text }));
    } catch (err) {
      if (err.status === 429) {
         setFeedback(p => ({ ...p, [sub._id]: "[AI rate limit: please slow down]" }));
      } else {
         setFeedback(p => ({ ...p, [sub._id]: "Excellent job!" }));
      }
    } finally {
      setAiDrafting(p => ({ ...p, [sub._id]: false }));
    }
  }

  const isPending = statusFilter === "pending";
  const isApproved = statusFilter === "approved";
  const isRejected = statusFilter === "rejected";

  const tabColors = {
    pending: { active: "bg-amber-100 text-amber-800 border-amber-300", dot: "bg-amber-400" },
    approved: { active: "bg-emerald-100 text-emerald-800 border-emerald-300", dot: "bg-emerald-400" },
    rejected: { active: "bg-rose-100 text-rose-800 border-rose-300", dot: "bg-rose-400" },
  };

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
              {isPending && (
                <>
                  <button onClick={() => { decide(previewSub._id, "rejected"); setPreviewSub(null); }} className="px-5 py-2.5 rounded-xl font-bold bg-white border-2 border-slate-200 text-slate-600 hover:bg-slate-50 transition">Reject</button>
                  <button onClick={() => { decide(previewSub._id, "approved"); setPreviewSub(null); }} className="px-5 py-2.5 rounded-xl font-bold bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 transition">Approve Mission</button>
                </>
              )}
              {!isPending && (
                <button onClick={() => setPreviewSub(null)} className="px-5 py-2.5 rounded-xl font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition">Close</button>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {message ? <div className="mb-4 rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-2 text-sm font-medium">{message}</div> : null}

      {/* Tab Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-3 flex flex-wrap gap-2 mb-4">
        {["pending", "approved", "rejected"].map((f) => {
          const colors = tabColors[f];
          const isActive = statusFilter === f;
          return (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 border ${
                isActive ? `${colors.active} border shadow-sm` : "bg-slate-50 text-slate-500 border-transparent hover:bg-slate-100"
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isActive ? colors.dot : "bg-slate-300"}`} />
              {f[0].toUpperCase() + f.slice(1)}
            </button>
          );
        })}
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="text-left p-3">Student</th>
                <th className="text-left p-3">Task</th>
                <th className="text-left p-3">{isPending ? "Flags" : "Status"}</th>
                <th className="text-left p-3">Feedback</th>
                <th className="text-left p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {!loading &&
                rows.map((s) => {
                  const lastFb = getLastFeedback(s);
                  const isEditing = editingFeedback[s._id];

                  return (
                    <motion.tr key={s._id} whileHover={{ backgroundColor: "#f8fafc" }} className={`border-t border-slate-100 ${isRejected ? "bg-rose-50/30" : ""}`}>
                      {/* Student */}
                      <td className="p-3 font-semibold">
                        <div className="flex items-center gap-2">
                          {s?.student?.name || "N/A"}
                          {s.attemptCount > 1 && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">
                              Attempt #{s.attemptCount}
                            </span>
                          )}
                          <StatusBadge status={s.status} />
                        </div>
                        <p className="text-xs text-slate-500 font-normal mt-0.5">
                          {`${s?.student?.class || s?.student?.className || "Class N/A"}${s?.student?.section || ""}`}
                        </p>
                      </td>

                      {/* Task */}
                      <td className="p-3">{s?.task?.title || "Task"}</td>

                      {/* Flags / Audit Info */}
                      <td className="p-3">
                        {isPending ? (
                          Array.isArray(s.autoFlags) && s.autoFlags.length ? (
                            <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-red-100 text-red-700">
                              <ShieldAlert className="w-3.5 h-3.5" />
                              {s.autoFlags.map(flagLabel).join(", ")}
                            </span>
                          ) : (
                            <span className="text-slate-400">None</span>
                          )
                        ) : (
                          <div className="text-xs text-slate-500 space-y-1">
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-3 h-3" />
                              <span>{isApproved ? "Approved" : "Rejected"} {formatDate(s.verifiedAt)}</span>
                            </div>
                            {lastFb?.by && (
                              <div className="text-slate-400">by {lastFb.by}</div>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Feedback Column — varies per tab */}
                      <td className="p-3 min-w-[280px]">
                        {isPending ? (
                          <>
                            <input
                              value={feedback[s._id] || ""}
                              onChange={(e) => setFeedback((p) => ({ ...p, [s._id]: e.target.value }))}
                              className="w-full rounded-lg border border-slate-200 px-3 py-1.5 focus:border-emerald-500 outline-none text-sm"
                              placeholder="Type feedback or click template..."
                            />
                            <div className="flex gap-1.5 mt-2 flex-wrap items-center">
                              <button 
                                onClick={() => generateAIFeedback(s)}
                                disabled={aiDrafting[s._id]}
                                className="text-[10px] sm:text-xs px-2 py-1 rounded bg-purple-50 text-purple-700 font-bold border border-purple-200 hover:bg-purple-100 transition disabled:opacity-50"
                              >
                                {aiDrafting[s._id] ? "Drafting..." : <span className="flex items-center gap-1"><Sparkles className="w-3 h-3 text-purple-600" /> AI Draft</span>}
                              </button>
                              {["Blurry image", "Wrong activity", "Incomplete"].map(tpl => (
                                <button 
                                  key={tpl} 
                                  onClick={() => setFeedback(p => ({ ...p, [s._id]: tpl }))}
                                  className="text-[10px] sm:text-xs px-2 py-1 rounded bg-slate-100 text-slate-600 hover:bg-slate-200 transition font-medium"
                                >
                                  {tpl}
                                </button>
                              ))}
                            </div>
                          </>
                        ) : isEditing ? (
                          <div className="space-y-2">
                            <input
                              value={feedback[s._id] ?? (lastFb?.message || "")}
                              onChange={(e) => setFeedback((p) => ({ ...p, [s._id]: e.target.value }))}
                              className="w-full rounded-lg border border-blue-300 px-3 py-1.5 outline-none text-sm bg-blue-50 focus:border-blue-500"
                              placeholder="Update feedback..."
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() => updateFeedbackOnly(s._id)}
                                className="text-xs px-3 py-1 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 transition"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setEditingFeedback(p => ({ ...p, [s._id]: false }))}
                                className="text-xs px-3 py-1 rounded-lg bg-slate-100 text-slate-600 font-semibold hover:bg-slate-200 transition"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className={`rounded-lg px-3 py-2 text-sm ${isRejected ? "bg-rose-50 border border-rose-100 text-rose-800" : "bg-slate-50 border border-slate-100 text-slate-700"}`}>
                            {lastFb?.message || <span className="text-slate-400 italic">No feedback given</span>}
                          </div>
                        )}
                      </td>

                      {/* Actions Column — varies per tab */}
                      <td className="p-3">
                        <div className="flex gap-2 flex-wrap min-w-[200px]">
                          {/* View/Preview — always available */}
                          {(s.imageUrl || s.content) && (
                            <button onClick={() => setPreviewSub(s)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 font-bold hover:bg-blue-100 transition shadow-sm border border-blue-200">
                              {s.fileMime?.startsWith("video") ? <PlayCircle className="w-3.5 h-3.5" /> : <ImageIcon className="w-3.5 h-3.5" />}
                              {isPending ? "Preview" : "View"}
                            </button>
                          )}

                          {/* PENDING: Approve + Reject */}
                          {isPending && (
                            <>
                              <button onClick={() => decide(s._id, "approved")} className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 font-bold text-white shadow-sm transition">Approve</button>
                              <button onClick={() => decide(s._id, "rejected")} className="px-3 py-1.5 rounded-lg bg-rose-50 border-2 border-rose-200 text-rose-700 font-bold hover:bg-rose-100 transition">Reject</button>
                            </>
                          )}

                          {/* APPROVED: Edit Feedback + Move to Rejected */}
                          {isApproved && (
                            <>
                              <button
                                onClick={() => {
                                  setEditingFeedback(p => ({ ...p, [s._id]: true }));
                                  setFeedback(p => ({ ...p, [s._id]: lastFb?.message || "" }));
                                }}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition border border-slate-200"
                              >
                                <Pencil className="w-3.5 h-3.5" /> Edit Feedback
                              </button>
                              <button onClick={() => decide(s._id, "rejected")} className="px-3 py-1.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 font-bold hover:bg-rose-100 transition text-xs">
                                Move to Rejected
                              </button>
                            </>
                          )}

                          {/* REJECTED: Edit Feedback + Approve Now */}
                          {isRejected && (
                            <>
                              <button
                                onClick={() => {
                                  setEditingFeedback(p => ({ ...p, [s._id]: true }));
                                  setFeedback(p => ({ ...p, [s._id]: lastFb?.message || "" }));
                                }}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition border border-slate-200"
                              >
                                <Pencil className="w-3.5 h-3.5" /> Edit Feedback
                              </button>
                              <button onClick={() => decide(s._id, "approved")} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 font-bold text-white shadow-sm transition">
                                <Check className="w-3.5 h-3.5" /> Approve Now
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
            </tbody>
          </table>
        </div>
        {loading && (
          <div className="p-8 text-center text-slate-400 font-medium animate-pulse">Loading submissions...</div>
        )}
        {!loading && rows.length === 0 ? (
          <div className="p-8 text-center text-slate-500">No submissions match this filter.</div>
        ) : null}
      </div>
    </TeacherShell>
  );
}
