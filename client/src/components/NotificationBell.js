import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Megaphone, X, PartyPopper } from "lucide-react";
import { apiRequest } from "../api/httpClient";

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function getPriorityInfo(message) {
  const lmsg = (message || "").toLowerCase();
  if (lmsg.includes("quiz") || lmsg.includes("deadline") || lmsg.includes("urgent") || lmsg.includes("tomorrow")) {
    return { level: 2, label: "Urgent", badgeClass: "bg-red-100 text-red-700 border-red-200", iconClass: "text-red-500" };
  }
  if (lmsg.includes("mission") || lmsg.includes("streak") || lmsg.includes("reminder") || lmsg.includes("pending")) {
    return { level: 1, label: "Reminder", badgeClass: "bg-amber-100 text-amber-700 border-amber-200", iconClass: "text-amber-500" };
  }
  return { level: 0, label: "Info", badgeClass: "bg-emerald-100 text-emerald-700 border-emerald-200", iconClass: "text-emerald-500" };
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [announcements, setAnnouncements] = useState([]);
  const [readIds, setReadIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("eco_read_announcements") || "[]");
    } catch { return []; }
  });
  const [loaded, setLoaded] = useState(false);
  const panelRef = useRef(null);

  // Fetch on mount
  useEffect(() => {
    apiRequest("/api/announcements/student")
      .then((data) => {
        setAnnouncements(Array.isArray(data) ? data : []);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const unreadCount = announcements.filter((a) => !readIds.includes(a._id)).length;

  function markAsRead(id) {
    if (readIds.includes(id)) return;
    const next = [...readIds, id];
    setReadIds(next);
    localStorage.setItem("eco_read_announcements", JSON.stringify(next));
  }

  function markAllRead() {
    const allIds = announcements.map((a) => a._id);
    setReadIds(allIds);
    localStorage.setItem("eco_read_announcements", JSON.stringify(allIds));
  }

  const sortedAnnouncements = React.useMemo(() => {
    return [...announcements].sort((a, b) => {
      const pA = getPriorityInfo(a.message).level;
      const pB = getPriorityInfo(b.message).level;
      if (pA !== pB) return pB - pA;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [announcements]);

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell Button */}
      <motion.button
        onClick={() => setOpen((v) => !v)}
        animate={unreadCount > 0 ? { rotate: [0, -10, 10, -10, 0] } : {}}
        transition={unreadCount > 0 ? { duration: 0.5, repeat: Infinity, repeatDelay: 5 } : {}}
        className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-800 transition-all hover:scale-105"
        title="Announcements"
      >
        <Bell className="w-[18px] h-[18px]" strokeWidth={2.2} />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 1 }}
            className="absolute -top-1 -right-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white shadow-sm ring-2 ring-white px-1"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </motion.span>
        )}
      </motion.button>

      {/* Dropdown Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.18 }}
            className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white border border-slate-200 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] overflow-hidden z-50"
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
              <h3 className="font-bold text-sm text-slate-800">Announcements</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 transition"
                  >
                    Mark all read
                  </button>
                )}
                <button onClick={() => setOpen(false)} className="p-1 hover:bg-slate-200 rounded-lg transition">
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              </div>
            </div>

            {/* List */}
            <div className="max-h-[360px] overflow-y-auto">
              {!loaded ? (
                <div className="p-6 text-center text-slate-400 animate-pulse text-sm">Loading...</div>
              ) : sortedAnnouncements.length === 0 ? (
                <div className="p-8 text-center bg-white/50">
                  <div className="flex justify-center mb-3">
                    <PartyPopper size={36} className="text-yellow-500" strokeWidth={2} />
                  </div>
                  <p className="text-sm text-slate-800 font-bold font-display">You&apos;re all caught up!</p>
                  <p className="text-xs text-slate-500 mt-1 font-medium">No new notifications right now. Keep up the great work!</p>
                </div>
              ) : (
                sortedAnnouncements.map((a) => {
                  const isUnread = !readIds.includes(a._id);
                  const senderRole = a.teacher?.role === "principal" ? "Principal" : "Teacher";
                  const senderName = a.teacher?.name || senderRole;
                  const priority = getPriorityInfo(a.message);

                  return (
                    <button
                      key={a._id}
                      onClick={() => markAsRead(a._id)}
                      className={`w-full text-left px-4 py-3 border-b border-slate-50 hover:bg-slate-50 transition-colors ${
                        isUnread ? "bg-slate-50/50" : ""
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`mt-0.5 p-1.5 rounded-lg shrink-0 bg-white border border-slate-100 shadow-sm`}>
                          <Megaphone className={`w-4 h-4 ${priority.iconClass}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider border ${priority.badgeClass}`}>
                              {priority.label}
                            </span>
                            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                              senderRole === "Principal"
                                ? "bg-purple-100 text-purple-700"
                                : "bg-emerald-100 text-emerald-700"
                            }`}>
                              {senderRole}
                            </span>
                            {isUnread && (
                              <span className="w-2 h-2 rounded-full bg-red-500 ml-auto shrink-0 shadow-sm" />
                            )}
                          </div>
                          <p className={`text-sm leading-snug line-clamp-2 ${isUnread ? "font-bold text-slate-800" : "font-medium text-slate-600"}`}>
                            {a.message}
                          </p>
                          <div className="flex items-center gap-2 mt-1.5 text-[11px] font-medium text-slate-400">
                            <span>{senderName}</span>
                            <span>·</span>
                            <span>{timeAgo(a.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
