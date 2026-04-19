import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Map, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  ArrowLeft,
  Star,
  Gamepad2,
  Brain,
  ShoppingBag,
  Flame,
  Zap,
  Leaf,
  Target,
  Hourglass,
  Sparkles
} from "lucide-react";
import { Badge, IconBox, EcoLoader, SproutyQuizBuddy } from "../components";
import { apiRequest } from "../api/httpClient";
import useFeedback from "../hooks/useFeedback";
import useSound from "../hooks/useSound";
import confetti from "canvas-confetti";
import { getStoredUser } from "../utils/authStorage";

function getDifficultyColor(d) {
  const diff = String(d || "easy").toLowerCase();
  if (diff === "hard") return "red";
  if (diff === "medium") return "yellow";
  return "green";
}

export default function Missions() {
  const [tasks, setTasks] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("active");
  const navigate = useNavigate();
  const { playClick, playSuccess } = useSound();
  const { triggerXPFromEvent } = useFeedback();
  
  const user = getStoredUser() || { name: "Eco Hero" };
  const streak = parseInt(localStorage.getItem("ecoStreak") || "0", 10);

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

  const { missionsToday, xpToday } = useMemo(() => {
    const today = new Date().toDateString();
    let mCount = 0;
    let xpSum = 0;
    submissions.forEach(s => {
      if ((s.status === "approved" || s.status === "completed") && new Date(s.updatedAt || s.createdAt).toDateString() === today) {
        mCount++;
        const t = tasks.find(tsk => tsk._id === (s.task?._id || s.task));
        if (t && t.points) {
          xpSum += t.points;
        }
      }
    });
    return { missionsToday: mCount, xpToday: xpSum };
  }, [submissions, tasks]);

  const featuredMission = useMemo(() => {
    if (categorized.active.length > 0) {
      return categorized.active.find(t => t.difficulty === "easy") || categorized.active[0];
    }
    return null;
  }, [categorized.active]);

  if (loading) return <EcoLoader text="Loading Mission Control..." />;

  const tabs = [
    { id: "active", label: "Active", count: categorized.active.length, icon: Target, color: "text-blue-600 bg-blue-50 border-blue-200 ring-blue-400/30" },
    { id: "pending", label: "Pending", count: categorized.pending.length, icon: Clock, color: "text-amber-600 bg-amber-50 border-amber-200 ring-amber-400/30" },
    { id: "completed", label: "Completed", count: categorized.completed.length, icon: CheckCircle2, color: "text-emerald-600 bg-emerald-50 border-emerald-200 ring-emerald-400/30" }
  ];

  const firstName = user?.name?.split(" ")[0] || "Eco Hero";

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#E8F5E9] via-[#F9FAF7] to-[#FFFDE7] pb-24">
      {/* Background Particles / Blobs */}
      <div className="absolute inset-0 pointer-events-none z-0" aria-hidden>
        <div className="absolute -top-28 -left-28 w-96 h-96 rounded-full bg-emerald-300/20 blur-3xl" />
        <div className="absolute top-40 right-[-5rem] w-80 h-80 rounded-full bg-blue-200/20 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Navigation & Quick Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/dashboard")}
            className="inline-flex max-w-[fit-content] items-center gap-2 px-4 py-2.5 rounded-xl bg-white/70 backdrop-blur-md border border-slate-200 text-slate-700 font-bold text-sm shadow-sm hover:shadow transition"
          >
            <ArrowLeft className="w-4 h-4" /> Dashboard
          </motion.button>

          <div className="flex gap-2 bg-white/50 p-1.5 rounded-2xl shadow-sm border border-emerald-100 backdrop-blur-md overflow-x-auto no-scrollbar max-w-[fit-content]">
            <button
              onClick={() => { playClick(); navigate("/mini-games"); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs text-blue-700 hover:bg-blue-100/70 transition whitespace-nowrap"
            >
              <Gamepad2 className="w-3.5 h-3.5" /> Play Game
            </button>
            <button
              onClick={() => { playClick(); navigate("/quizzes"); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs text-purple-700 hover:bg-purple-100/70 transition whitespace-nowrap"
            >
              <Brain className="w-3.5 h-3.5" /> Take Quiz
            </button>
            <button
              onClick={() => { playClick(); navigate("/store"); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs text-emerald-700 hover:bg-emerald-100/70 transition whitespace-nowrap"
            >
              <ShoppingBag className="w-3.5 h-3.5" /> Visit Store
            </button>
          </div>
        </div>

        {/* Mission Control Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <div className="flex items-center gap-3 mb-4">
            <IconBox color="blue" size="xl" className="rounded-3xl shadow-sm bg-gradient-to-br from-blue-100 to-indigo-50 border border-blue-200">
              <Map className="w-10 h-10 text-blue-600" strokeWidth={2.2} />
            </IconBox>
            <div>
              <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 tracking-tight">
                Ready for your next eco mission,{" "}
                <span className="bg-gradient-to-r from-emerald-600 to-green-500 bg-clip-text text-transparent">
                  {firstName}?
                </span> <Leaf className="inline-block mb-1 w-8 h-8 text-emerald-500" strokeWidth={2.5}/>
              </h1>
              <p className="font-medium text-slate-500 mt-1">
                Mission Control Center - Track, play, and make an impact!
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 md:gap-4 max-w-2xl">
            <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-orange-100 p-3 sm:px-5 sm:py-4 flex items-center gap-3 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center shrink-0">
                <Flame className="w-5 h-5 text-orange-500" strokeWidth={2.5}/>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Streak</p>
                <p className="font-display font-bold text-lg text-slate-800">{streak} Days</p>
              </div>
            </div>
            <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-emerald-100 p-3 sm:px-5 sm:py-4 flex items-center gap-3 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                <Target className="w-5 h-5 text-emerald-600" strokeWidth={2.5}/>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Missions Today</p>
                <p className="font-display font-bold text-lg text-slate-800">{missionsToday}</p>
              </div>
            </div>
            <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-yellow-100 p-3 sm:px-5 sm:py-4 flex items-center gap-3 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center shrink-0">
                <Zap className="w-5 h-5 text-yellow-500" strokeWidth={2.5}/>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">XP Today</p>
                <p className="font-display font-bold text-lg text-slate-800">+{xpToday}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Featured Mission Hero Card (Only show if there's an active one) */}
        {featuredMission && activeTab === "active" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="mb-10 relative isolate rounded-3xl bg-gradient-to-br from-[#1B4332] to-[#2D6A4F] p-1 shadow-xl overflow-hidden"
          >
            {/* Inner background and floating shapes */}
            <div className="absolute inset-0 z-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            <div className="absolute top-[-20%] right-[-10%] w-[300px] h-[300px] rounded-full bg-emerald-400 opacity-20 blur-3xl"></div>
            
            <div className="relative z-10 bg-[#163c2b]/30 backdrop-blur-sm rounded-[22px] p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 border border-white/10">
              <div className="flex-1 text-white">
                <div className="flex items-center gap-3 mb-3">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-emerald-200 text-xs font-bold uppercase tracking-wider shadow-inner">
                    <Sparkles className="w-3.5 h-3.5" /> Today's Featured Mission
                  </span>
                  <Badge variant={getDifficultyColor(featuredMission.difficulty)} className="border-none shadow-sm">
                    {featuredMission.difficulty || "Medium"}
                  </Badge>
                </div>
                <h2 className="font-display font-bold text-2xl sm:text-3xl text-white mb-2 leading-tight">
                  {featuredMission.title}
                </h2>
                <p className="text-emerald-100/90 text-sm sm:text-base font-medium max-w-xl">
                  {featuredMission.description}
                </p>
              </div>
              <div className="flex flex-col items-start md:items-end gap-4 shrink-0">
                <div className="flex items-center gap-2 px-4 py-2 bg-black/20 rounded-xl border border-white/5 backdrop-blur-md">
                  <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                  <span className="font-display font-bold text-xl text-white">+{featuredMission.points} XP</span>
                </div>
                <button
                  onClick={() => { playClick(); navigate(`/submit/${featuredMission._id}`); }}
                  className="group flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-white hover:bg-emerald-50 text-emerald-900 font-bold text-sm shadow-lg hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] transition-all active:scale-95"
                >
                  Start Mission <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Dynamic Tabs */}
        <div className="flex gap-3 bg-white/40 p-2 sm:p-2.5 items-center rounded-2xl shadow-inner border border-white/60 w-full overflow-x-auto no-scrollbar mb-6 backdrop-blur-md">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => { playClick(); setActiveTab(tab.id); }}
                className={`relative flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-all duration-300 flex-1 sm:flex-none ${
                  isActive
                    ? `shadow-md ring-1 ring-inset ${tab.color.split(' ')[2]} ${tab.color.split(' ')[1]} ${tab.color.split(' ')[0]} ${tab.color.split(' ')[3]} scale-[1.02] bg-white`
                    : "text-slate-500 hover:bg-white/60 hover:text-slate-700"
                }`}
              >
                <Icon className="w-4 h-4" strokeWidth={isActive ? 2.5 : 2} />
                {tab.label}
                <span className={`px-2 py-0.5 rounded-full text-xs ml-1 transition-colors ${isActive ? "bg-white text-slate-800 shadow-sm" : "bg-slate-200/50"}`}>
                  {tab.count}
                </span>
                {isActive && (
                  <motion.div layoutId="missionTabIndicator" className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-8 h-1 bg-current rounded-t-full hidden sm:block" />
                )}
              </button>
            );
          })}
        </div>

        {/* Content Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {categorized[activeTab].length === 0 ? (
              <div className="col-span-full py-16 px-6 text-center bg-white/70 backdrop-blur-xl rounded-[2rem] border border-dashed border-emerald-200/60 shadow-sm flex flex-col items-center justify-center min-h-[300px]">
                {activeTab === "active" && (
                  <>
                    <SproutyQuizBuddy mood="idle" caption="" />
                    <h3 className="font-display font-bold text-2xl text-slate-800 mt-6 mb-2 flex items-center justify-center gap-2">No missions right now <Sparkles className="w-6 h-6 text-yellow-500" /></h3>
                    <p className="text-slate-500 font-medium max-w-sm mb-8">You're all caught up! Try a quiz or game to earn extra XP while you wait.</p>
                    <div className="flex flex-wrap justify-center gap-3">
                      <button onClick={() => navigate('/mini-games')} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition-colors flex items-center gap-2">
                        <Gamepad2 className="w-4 h-4" /> Play Game
                      </button>
                      <button onClick={() => navigate('/quizzes')} className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-md transition-colors flex items-center gap-2">
                        <Brain className="w-4 h-4" /> Take Quiz
                      </button>
                    </div>
                  </>
                )}
                {activeTab === "pending" && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center">
                    <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mb-6">
                      <Hourglass className="w-10 h-10 text-amber-500 animate-pulse" />
                    </div>
                    <h3 className="font-display font-bold text-2xl text-slate-800 mb-2 flex items-center justify-center gap-2">In Review <Hourglass className="w-6 h-6 text-amber-500" /></h3>
                    <p className="text-slate-500 font-medium max-w-sm">Your submissions are currently being reviewed by your teachers. Sit tight!</p>
                  </motion.div>
                )}
                {activeTab === "completed" && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center">
                    <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6">
                      <Leaf className="w-10 h-10 text-emerald-500" />
                    </div>
                    <h3 className="font-display font-bold text-2xl text-slate-800 mb-2 flex items-center justify-center gap-2">Awaiting Progress <Leaf className="w-6 h-6 text-emerald-500" /></h3>
                    <p className="text-slate-500 font-medium max-w-sm">You haven't completed any missions yet. Time to start making an impact!</p>
                  </motion.div>
                )}
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
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                    whileHover={{ y: -6, scale: 1.02 }}
                    className={`relative overflow-hidden bg-white/80 backdrop-blur-md rounded-3xl p-6 border transition-all duration-300 shadow-sm hover:shadow-[0_15px_30px_-5px_rgba(0,0,0,0.1)] flex flex-col ${
                      isCompleted ? "border-emerald-200" : isPending ? "border-amber-200" : "border-gray-200 hover:border-emerald-300"
                    }`}
                  >
                    {/* Background Graphic */}
                    {isCompleted && (
                      <div className="absolute -right-4 -top-4 text-emerald-500/10 z-0">
                        <CheckCircle2 className="w-32 h-32" />
                      </div>
                    )}
                    {isPending && (
                       <div className="absolute -right-4 -top-4 text-amber-500/5 z-0">
                         <Hourglass className="w-32 h-32" />
                       </div>
                    )}

                    <div className="flex items-start justify-between mb-4 relative z-10">
                      <Badge variant={isCompleted ? "success" : isPending ? "warning" : "info"}>
                        {isCompleted ? "Approved" : isPending ? "In Review" : "New Mission"}
                      </Badge>
                      <Badge variant={getDifficultyColor(task.difficulty)}>{task.difficulty || "Medium"}</Badge>
                    </div>

                    <h3 className="font-display font-bold text-xl text-slate-800 leading-tight mb-2 relative z-10">{task.title}</h3>
                    <p className="text-sm font-medium text-slate-500 mb-5 line-clamp-2 pr-2 relative z-10 flex-grow">{task.description}</p>

                    <div className="mt-auto relative z-10 space-y-4">
                      {/* Sub-info bar */}
                      <div className="flex items-center justify-between py-2 px-3 bg-slate-50/80 rounded-xl border border-slate-100">
                        <span className="flex items-center gap-1.5 font-bold text-amber-600 text-sm">
                          <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                          +{task.points} XP
                        </span>
                        {task.deadline && !isCompleted && !isPending && (
                          <span className="flex items-center gap-1 text-xs font-bold text-red-500/90">
                            <Clock className="w-3.5 h-3.5" />
                            {new Date(task.deadline).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                          </span>
                        )}
                      </div>

                      {/* Action Button */}
                      {!isCompleted && !isPending && (
                        <button
                          onClick={() => { playClick(); navigate(`/submit/${task._id}`); }}
                          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-900 hover:bg-emerald-600 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
                        >
                          Start Mission <ArrowRight className="w-4 h-4" />
                        </button>
                      )}

                      {isPending && (
                        <div className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-amber-50 text-amber-700 font-bold border border-amber-200/60 text-sm cursor-not-allowed">
                          <Clock className="w-4 h-4 animate-pulse duration-1000" />
                          Awaiting Review
                        </div>
                      )}

                      {isCompleted && (
                        <button
                          onClick={(e) => { 
                            playSuccess(); 
                            confetti({
                              particleCount: 100,
                              spread: 70,
                              origin: { y: 0.6 },
                              colors: ['#34D399', '#10B981', '#059669', '#FBBF24']
                            });
                            triggerXPFromEvent(0, e, { y: window.innerHeight * 0.4 }); 
                          }}
                          className="group w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold border border-emerald-200 text-sm transition-all active:scale-[0.98]"
                        >
                          <CheckCircle2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
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
      </div>
    </div>
  );
}
