import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Map, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  Star,
  Shield,
  Search
} from "lucide-react";
import { Badge, IconBox, EcoLoader } from "../components";
import { apiRequest } from "../api/httpClient";
import useFeedback from "../hooks/useFeedback";
import useSound from "../hooks/useSound";

function getDifficultyColor(d) {
  const diff = (d || "easy").toLowerCase();
  if (diff === "hard") return "red";
  if (diff === "medium") return "yellow";
  return "green";
}

export default function Missions() {
  const [tasks, setTasks] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("active"); // active, pending, completed
  const navigate = useNavigate();
  const { playClick, playSuccess } = useSound();
  const { triggerXPFromEvent } = useFeedback();

  useEffect(() => {
    Promise.all([
      apiRequest("/api/tasks").catch(() => []),
      apiRequest("/api/submissions/my").catch(() => [])
    ])
      .then(([tasksResp, subResp]) => {
        const t = Array.isArray(tasksResp) ? tasksResp : tasksResp.tasks || [];
        const s = Array.isArray(subResp) ? subResp : subResp.submissions || [];
        setTasks(t);
        setSubmissions(s);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const categorized = useMemo(() => {
    const active = [];
    const pending = [];
    const completed = [];

    tasks.forEach(t => {
      const relatedSub = submissions.find(s => s.task?._id === t._id || s.task === t._id);
      
      if (!relatedSub || relatedSub.status === "rejected") {
        active.push(t);
      } else if (relatedSub.status === "pending") {
        pending.push({ ...t, submission: relatedSub });
      } else if (relatedSub.status === "approved" || relatedSub.status === "completed") {
        completed.push({ ...t, submission: relatedSub });
      }
    });

    return { active, pending, completed };
  }, [tasks, submissions]);

  if (loading) return <EcoLoader text="Loading your missions..." />;

  const tabs = [
    { id: "active", label: "Active", count: categorized.active.length, icon: Map, color: "text-blue-600 bg-blue-50 border-blue-200" },
    { id: "pending", label: "Pending", count: categorized.pending.length, icon: Clock, color: "text-amber-600 bg-amber-50 border-amber-200" },
    { id: "completed", label: "Completed", count: categorized.completed.length, icon: CheckCircle2, color: "text-emerald-600 bg-emerald-50 border-emerald-200" }
  ];

  return (
    <div className="min-h-screen pb-20 bg-[#F7FBF8]">
      {/* Header Profile Section */}
      <section className="bg-white border-b border-eco-pale pb-6 pt-8 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <IconBox color="blue" size="xl" className="rounded-[2rem] shadow-sm">
              <Map className="w-8 h-8 md:w-10 md:h-10 text-blue-600" strokeWidth={2.5} />
            </IconBox>
            <div>
              <h1 className="font-display font-extrabold text-3xl md:text-4xl text-gray-900 tracking-tight">
                Missions
              </h1>
              <p className="font-semibold text-gray-500 mt-1 flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-500" strokeWidth={2.5} />
                Complete challenges assigned by your teacher.
              </p>
            </div>
          </div>

          <div className="flex gap-3 bg-[#f0f6f1] p-2 xl:p-3 items-center rounded-2xl shadow-inner w-full md:w-auto overflow-x-auto no-scrollbar">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => { playClick(); setActiveTab(tab.id); }}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-all duration-300 ${
                    isActive
                      ? `shadow-sm ring-1 ring-inset ${tab.color.split(' ')[2]} ${tab.color.split(' ')[1]} ${tab.color.split(' ')[0]} scale-100`
                      : "text-gray-500 hover:bg-white/60 scale-95 hover:scale-100"
                  }`}
                >
                  <Icon className="w-4 h-4" strokeWidth={isActive ? 3 : 2} />
                  {tab.label}
                  <span className={`px-2 py-0.5 rounded-full text-xs ml-1 ${isActive ? "bg-white/60" : "bg-gray-200/60"}`}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Content Area */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {categorized[activeTab].length === 0 ? (
              <div className="col-span-full py-16 text-center bg-white rounded-3xl border border-dashed border-gray-300">
                <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="inline-flex w-16 h-16 rounded-full bg-gray-50 items-center justify-center mb-4">
                  <Search className="w-8 h-8 text-gray-400" />
                </motion.div>
                <h3 className="font-display font-bold text-xl text-gray-800">No {activeTab} missions found.</h3>
                <p className="text-gray-500 mt-2 font-medium max-w-sm mx-auto">
                  {activeTab === "active" ? "You're all caught up! Great job." : activeTab === "pending" ? "You haven't submitted any missions for review yet." : "Complete some active missions to see them here!"}
                </p>
              </div>
            ) : (
              categorized[activeTab].map((task, i) => {
                const isCompleted = activeTab === "completed";
                const isPending = activeTab === "pending";
                
                return (
                  <motion.div
                    key={task._id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    whileHover={{ y: -4, scale: 1.01 }}
                    className={`relative overflow-hidden bg-white rounded-3xl p-6 border-2 transition-shadow shadow-sm hover:shadow-card-hover flex flex-col ${
                      isCompleted ? "border-emerald-200" : isPending ? "border-amber-200" : "border-gray-200 hover:border-blue-200"
                    }`}
                  >
                    {/* Background Graphic */}
                    {isCompleted && (
                      <div className="absolute -right-4 -top-4 text-emerald-500/10">
                        <CheckCircle2 className="w-32 h-32" />
                      </div>
                    )}

                    <div className="flex items-start justify-between mb-4 relative z-10">
                      <Badge variant={isCompleted ? "success" : isPending ? "warning" : "info"}>
                        {isCompleted ? "Approved" : isPending ? "In Review" : "New Mission"}
                      </Badge>
                      <Badge variant={getDifficultyColor(task.difficulty)}>{task.difficulty || "Medium"}</Badge>
                    </div>

                    <h3 className="font-display font-bold text-xl text-gray-800 leading-tight mb-2 relative z-10">{task.title}</h3>
                    <p className="text-sm font-medium text-gray-500 mb-5 line-clamp-2 pr-2 relative z-10 flex-grow">{task.description}</p>

                    <div className="mt-auto relative z-10 space-y-4">
                      {/* Sub-info bar */}
                      <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-xl">
                        <span className="flex items-center gap-1.5 font-bold text-amber-700 text-sm">
                          <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                          +{task.points} XP
                        </span>
                        {task.deadline && !isCompleted && !isPending && (
                          <span className="flex items-center gap-1 text-xs font-bold text-red-500/80">
                            <Clock className="w-3.5 h-3.5" />
                            {new Date(task.deadline).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                          </span>
                        )}
                      </div>

                      {/* Action Button */}
                      {!isCompleted && !isPending && (
                        <button
                          onClick={() => { playClick(); navigate(`/submit/${task._id}`); }}
                          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gray-900 hover:bg-blue-600 text-white font-bold text-sm shadow-sm transition-colors"
                        >
                          Start Mission <ArrowRight className="w-4 h-4" />
                        </button>
                      )}

                      {isPending && (
                        <div className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-amber-50 text-amber-700 font-bold border border-amber-200 text-sm cursor-not-allowed">
                          <Clock className="w-4 h-4 animate-pulse" />
                          Awaiting Teacher Review
                        </div>
                      )}

                      {isCompleted && (
                        <button
                          onClick={(e) => { 
                            playSuccess(); 
                            triggerXPFromEvent(0, e, { y: window.innerHeight * 0.4 }); 
                          }}
                          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold border border-emerald-200 text-sm transition-colors"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          Mission Accomplished
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
