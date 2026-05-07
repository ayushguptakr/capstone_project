import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Sprout, MapPin, ClipboardList, Clock, ArrowLeft } from "lucide-react";
import { Badge, IconBox } from "../components";
import { apiRequest } from "../api/httpClient";
import ScheduleStatusHint from "../components/ScheduleStatusHint";

function getDifficulty(d) {
  const d2 = (d || "easy").toLowerCase();
  return d2 === "medium" ? "medium" : d2 === "hard" ? "hard" : "easy";
}

function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ total: 0, limit: 30, offset: 0, hasMore: false });
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      apiRequest(`/api/tasks?limit=${30}&offset=0`),
      apiRequest("/api/recommendations/tasks?limit=5").catch(() => ({ recommendations: [] })),
    ])
      .then(([all, rec]) => {
        const items = Array.isArray(all) ? all : all?.items || [];
        setTasks(items || []);
        if (all?.pagination) setPagination((p) => ({ ...p, ...all.pagination }));
        setRecommendations(rec.recommendations || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  async function fetchPage(nextOffset) {
    setLoading(true);
    try {
      const resp = await apiRequest(`/api/tasks?limit=${pagination.limit}&offset=${nextOffset}`);
      const items = Array.isArray(resp) ? resp : resp?.items || [];
      setTasks(items || []);
      if (resp?.pagination) setPagination((p) => ({ ...p, ...resp.pagination }));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-12 h-12 border-4 border-eco-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  function scheduleBadge(task) {
    const status = task?.schedule?.status || "unscheduled";
    if (status === "upcoming") return { text: "Opens Soon", cls: "bg-blue-100 text-blue-700" };
    if (status === "closed") return { text: "Closed", cls: "bg-rose-100 text-rose-700" };
    if (status === "active") return { text: "Scheduled", cls: "bg-indigo-100 text-indigo-700" };
    return { text: "Live", cls: "bg-emerald-100 text-emerald-700" };
  }

  function scheduleHint(task) {
    const status = task?.schedule?.status || "unscheduled";
    const start = task?.schedule?.startDate ? new Date(task.schedule.startDate).toLocaleDateString() : null;
    const end = task?.schedule?.endDate ? new Date(task.schedule.endDate).toLocaleDateString() : null;
    if (status === "upcoming" && start) return `Starts ${start}`;
    if (status === "closed") return end ? `Closed on ${end}` : "No longer available";
    if (status === "active" && end) return `Ends ${end}`;
    return "";
  }

  const TaskCard = ({ task, recommended }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => { if (task.isAvailableNow !== false) navigate(`/submit/${task._id}`); }}
      className="bg-white rounded-3xl p-6 shadow-card border-2 border-eco-pale/50 cursor-pointer hover:shadow-card-hover hover:border-eco-primary/20 transition-all"
    >
      <div className="flex items-start justify-between mb-3">
        <IconBox color={recommended ? "yellow" : "green"} size="lg" className="rounded-2xl">
          {recommended ? <MapPin className="w-8 h-8" strokeWidth={2} /> : <ClipboardList className="w-8 h-8" strokeWidth={2} />}
        </IconBox>
        <div className="flex items-center gap-2">
          <Badge variant={getDifficulty(task.difficulty)}>{task.difficulty || "Easy"}</Badge>
          <span className={`text-[11px] font-bold px-2 py-1 rounded-full ${scheduleBadge(task).cls}`}>
            {scheduleBadge(task).text}
          </span>
        </div>
      </div>
      <h3 className="font-display font-bold text-lg text-gray-800 mb-2">{task.title}</h3>
      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{task.description}</p>
      {scheduleHint(task) ? (
        <div className="mb-3 text-xs font-semibold text-slate-500">{scheduleHint(task)}</div>
      ) : null}
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-eco-accent/40 text-amber-800 font-semibold">
          +{task.points} XP
        </span>
        {task.deadline && (
          <span className="text-xs text-gray-500 flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(task.deadline).toLocaleDateString()}</span>
        )}
      </div>
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        disabled={task.isAvailableNow === false}
        className="mt-4 w-full py-3 rounded-2xl bg-eco-primary text-white font-bold shadow-soft disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {task.isAvailableNow === false ? "Unavailable" : "Start Task"}
      </motion.button>
    </motion.div>
  );

  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display font-bold text-2xl text-eco-primary flex items-center gap-2">
            <IconBox color="green" size="sm"><Sprout className="w-5 h-5" strokeWidth={2} /></IconBox>
            Eco Tasks
          </h1>
          <div className="flex items-center gap-2">
            <ScheduleStatusHint />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/dashboard")}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-eco-primary text-white font-semibold"
            >
              <ArrowLeft className="w-4 h-4" /> Dashboard
            </motion.button>
          </div>
        </div>

        {recommendations.length > 0 && (
          <section className="mb-8">
            <h2 className="font-display font-bold text-lg mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-eco-primary" /> Recommended for You
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {recommendations.map((t, i) => (
                <TaskCard key={t._id} task={t} recommended />
              ))}
            </div>
          </section>
        )}

        <h2 className="font-display font-bold text-lg mb-4">All Missions</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {tasks.length === 0 ? (
            <div className="col-span-2 text-center py-12 text-gray-500">No tasks yet. Check back soon!</div>
          ) : (
            tasks.map((t) => (
              <TaskCard key={t._id} task={t} />
            ))
          )}
        </div>
        {pagination.total > 0 ? (
          <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
            <span>
              Showing {pagination.offset + 1}-{Math.min(pagination.offset + tasks.length, pagination.total)} of {pagination.total}
            </span>
            <div className="flex gap-2">
              <button
                disabled={pagination.offset <= 0}
                onClick={() => fetchPage(Math.max(0, pagination.offset - pagination.limit))}
                className="px-3 py-2 rounded-xl border border-slate-200 disabled:opacity-40"
              >
                Prev
              </button>
              <button
                disabled={!pagination.hasMore}
                onClick={() => fetchPage(pagination.offset + pagination.limit)}
                className="px-3 py-2 rounded-xl border border-slate-200 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default Tasks;
