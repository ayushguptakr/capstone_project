import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Sprout, MapPin, ClipboardList, Clock, ArrowLeft } from "lucide-react";
import { Badge, IconBox } from "../components";
import { apiRequest } from "../api/httpClient";

function getDifficulty(d) {
  const d2 = (d || "easy").toLowerCase();
  return d2 === "medium" ? "medium" : d2 === "hard" ? "hard" : "easy";
}

function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      apiRequest("/api/tasks"),
      apiRequest("/api/recommendations/tasks?limit=5").catch(() => ({ recommendations: [] })),
    ])
      .then(([all, rec]) => {
        setTasks(all || []);
        setRecommendations(rec.recommendations || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-12 h-12 border-4 border-eco-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const TaskCard = ({ task, recommended }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => navigate(`/submit/${task._id}`)}
      className="bg-white rounded-3xl p-6 shadow-card border-2 border-eco-pale/50 cursor-pointer hover:shadow-card-hover hover:border-eco-primary/20 transition-all"
    >
      <div className="flex items-start justify-between mb-3">
        <IconBox color={recommended ? "yellow" : "green"} size="lg" className="rounded-2xl">
          {recommended ? <MapPin className="w-8 h-8" strokeWidth={2} /> : <ClipboardList className="w-8 h-8" strokeWidth={2} />}
        </IconBox>
        <Badge variant={getDifficulty(task.difficulty)}>{task.difficulty || "Easy"}</Badge>
      </div>
      <h3 className="font-display font-bold text-lg text-gray-800 mb-2">{task.title}</h3>
      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{task.description}</p>
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
        className="mt-4 w-full py-3 rounded-2xl bg-eco-primary text-white font-bold shadow-soft"
      >
        Start Task
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
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/dashboard")}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-eco-primary text-white font-semibold"
          >
            <ArrowLeft className="w-4 h-4" /> Dashboard
          </motion.button>
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
      </div>
    </div>
  );
}

export default Tasks;
