import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, Droplet, Zap, Trash2, CheckCircle, Leaf, X, Camera, Zap as ZapIcon, AlertCircle, BookOpen } from "lucide-react";
import { apiRequest } from "../api/httpClient";
import confetti from "canvas-confetti";
import { useAlert } from "./ui/AlertProvider";

const typeIcons = {
  water: <Droplet className="w-4 h-4 text-blue-500" />,
  energy: <Zap className="w-4 h-4 text-amber-500" />,
  waste: <Trash2 className="w-4 h-4 text-slate-500" />,
  habit: <Leaf className="w-4 h-4 text-green-500" />,
};

const questionBank = {
  water: [
    { q: "How much water is saved by fixing a leaky faucet?", options: ["None", "Up to 3,000 gallons/yr", "10 gallons/yr", "1 million gallons/yr"], ans: 1 },
    { q: "Which uses less water?", options: ["Taking a bath", "10-minute shower", "5-minute shower", "Washing car with hose"], ans: 2 }
  ],
  energy: [
    { q: "Which bulb is most energy efficient?", options: ["Incandescent", "Halogen", "LED", "Fluorescent"], ans: 2 },
    { q: "What handles vampire energy?", options: ["Unplugging devices", "Leaving them on", "Washing them", "Using batteries"], ans: 0 }
  ],
  waste: [
    { q: "Which of these takes longest to decompose?", options: ["Apple core", "Paper bag", "Plastic bottle", "Banana peel"], ans: 2 },
    { q: "What should NOT go in recycling?", options: ["Cardboard", "Glass jars", "Greasy pizza boxes", "Soda cans"], ans: 2 }
  ],
  habit: [
    { q: "What is the best way to reduce your carbon footprint daily?", options: ["Drive more", "Eat less meat", "Leave lights on", "Use plastic bags"], ans: 1 },
    { q: "What does 'reduce' mean in the 3 R's?", options: ["Making more waste", "Consuming less", "Recycling more", "Reusing items"], ans: 1 }
  ]
};

export default function DailyEcoPlan({ streak = 0, missionsCompleted = 0, level = 1 }) {
  const { showAlert } = useAlert();
  const [plan, setPlan] = useState([]);
  const [completedTaskIds, setCompletedTaskIds] = useState([]);
  const [taskStates, setTaskStates] = useState({}); // Stores: idle, in-progress, verified, completed
  const [isLoading, setIsLoading] = useState(false);
  
  // Verification Modal State
  const [activeTask, setActiveTask] = useState(null);
  const [modalStage, setModalStage] = useState("start"); // start, verifying, proof, quiz, done
  const [proofText, setProofText] = useState("");
  const [quizData, setQuizData] = useState(null);

  const fetchPlan = async () => {
    try {
      setIsLoading(true);
      const res = await apiRequest("/api/missions/today");
      if (res && res.success) {
        setPlan(res.plan || []);
        setCompletedTaskIds(res.completedTaskIds || []);
      }
    } catch (err) {
      console.warn("Error fetching Eco Plan", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlan();
  }, []);

  const openVerification = (task) => {
    if (completedTaskIds.includes(task.taskId)) return;
    
    // Set to in-progress
    setTaskStates(prev => ({ ...prev, [task.taskId]: "in-progress" }));
    setActiveTask(task);
    setModalStage("start");
    setProofText("");
    
    if (task.verificationType === "quiz") {
      const bank = questionBank[task.type] || questionBank.habit;
      const randomQ = bank[Math.floor(Math.random() * bank.length)];
      setQuizData(randomQ);
    }
  };

  const submitVerification = async (proofDataOverride) => {
    if (!activeTask) return;
    setModalStage("verifying");
    
    try {
      const res = await apiRequest("/api/missions/complete", {
        method: "POST",
        body: {
          taskId: activeTask.taskId,
          verificationType: activeTask.verificationType,
          proofData: proofDataOverride || proofText || "completed"
        }
      });

      if (res.success) {
        setModalStage("done");
        setTaskStates(prev => ({ ...prev, [activeTask.taskId]: "verified" }));
        
        // Gamification effects
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
        
        setTimeout(() => {
          setActiveTask(null);
          setTaskStates(prev => ({ ...prev, [activeTask.taskId]: "completed" }));
          setCompletedTaskIds(prev => [...prev, activeTask.taskId]);
        }, 2000);
      }
    } catch (err) {
      showAlert({ type: "warning", message: "You’ve already completed this today. Come back tomorrow 🌱" });
      setModalStage("start");
      setTaskStates(prev => ({ ...prev, [activeTask.taskId]: "idle" }));
    }
  };

  const handleQuickAction = () => {
    setModalStage("verifying");
    setTimeout(() => {
      setModalStage("confirm_quick");
    }, 2000); // simulate context-aware action
  };

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-[0_4px_24px_rgba(0,0,0,0.03)] border border-gray-100 flex flex-col h-full hover:shadow-[0_4px_30px_rgba(0,0,0,0.06)] transition-all">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-display font-bold text-[#2D332F] flex items-center gap-2">
            Today's Eco Plan
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100">Verified</span>
          </h3>
          <p className="text-xs text-gray-400 font-medium mt-0.5">Complete tasks to earn verified XP.</p>
        </div>
        <button 
          onClick={() => fetchPlan()} 
          disabled={isLoading}
          className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors disabled:opacity-50 group shadow-sm border border-slate-100"
          title="Refresh Plan"
        >
          <RefreshCw className={`w-4 h-4 text-slate-500 ${isLoading ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-500"}`} />
        </button>
      </div>

      <div className="flex flex-col gap-3 flex-grow">
        {isLoading ? (
          <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.5 }} className="flex flex-col gap-3">
             {[1,2,3].map(i => <div key={i} className="h-14 border border-gray-50 bg-slate-50/70 rounded-2xl w-full" />)}
          </motion.div>
        ) : plan.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-4 h-full min-h-[140px] opacity-70">
            <Leaf className="w-10 h-10 text-gray-300 mb-3" />
            <p className="text-sm font-semibold text-gray-500">Plan could not be generated.</p>
          </div>
        ) : (
          plan.map((t, i) => {
            const isCompleted = completedTaskIds.includes(t.taskId) || taskStates[t.taskId] === "completed";
            const status = isCompleted ? "completed" : (taskStates[t.taskId] || "idle");

            return (
              <motion.button 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                key={t.taskId || i} 
                onClick={() => status === "idle" && openVerification(t)}
                disabled={status !== "idle"}
                className={`flex items-center justify-between p-3.5 sm:px-4 rounded-2xl border shadow-sm group transition-all text-left w-full ${
                  isCompleted 
                    ? "bg-slate-50 border-slate-200 opacity-60 cursor-default" 
                    : status === "in-progress" || status === "verified"
                    ? "bg-emerald-50 border-emerald-300 cursor-wait"
                    : "bg-white border-slate-200 hover:shadow-md hover:-translate-y-0.5 cursor-pointer hover:border-emerald-200"
                }`}
              >
                <div className="flex items-center gap-3 w-full pr-3">
                  <div className={`p-2.5 rounded-xl border shadow-inner transition-colors ${
                    isCompleted || status === "verified" ? "bg-emerald-50 border-emerald-100" : "bg-slate-50 border-slate-100 group-hover:bg-white"
                  }`}>
                    {isCompleted || status === "verified" ? <CheckCircle className="w-5 h-5 text-emerald-500" /> : typeIcons[t.type] || <CheckCircle className="w-5 h-5 text-emerald-500" />}
                  </div>
                  <span className={`text-sm font-bold leading-snug ${isCompleted ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                    {t.task}
                  </span>
                </div>
                <span className={`text-xs font-bold px-2.5 py-1.5 rounded-lg shrink-0 border transition-colors ${
                  status === "completed" ? "text-emerald-500 bg-emerald-50 border-emerald-100" :
                  status === "verified" ? "text-white bg-emerald-500 border-emerald-600" :
                  status === "in-progress" ? "text-emerald-700 bg-emerald-100 border-emerald-300 animate-pulse" :
                  "text-emerald-600 bg-emerald-50 border-emerald-200 group-hover:bg-emerald-500 group-hover:text-white"
                }`}>
                  {status === "completed" ? "Done" : 
                   status === "verified" ? "Verified!" : 
                   status === "in-progress" ? "Verifying..." :
                   t.impact || "+10 XP"}
                </span>
              </motion.button>
            )
          })
        )}
      </div>

      <AnimatePresence>
        {activeTask && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => modalStage !== "verifying" && setActiveTask(null)}
            />
            
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="relative bg-white rounded-3xl shadow-xl w-full max-w-md p-6 overflow-hidden"
            >
              <button 
                onClick={() => setActiveTask(null)}
                disabled={modalStage === "verifying"}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="mb-6 pr-8">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 block">
                  Verify Completion
                </span>
                <h4 className="text-xl font-display font-bold text-slate-800">{activeTask.task}</h4>
                <div className="flex items-center gap-2 mt-3">
                   <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-100 rounded-lg text-emerald-600 text-xs font-bold">
                     <CheckCircle className="w-3.5 h-3.5" />
                     {activeTask.impact || "XP Reward"}
                   </span>
                   <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 text-xs font-bold capitalize">
                     {activeTask.verificationType} Task
                   </span>
                </div>
              </div>

              {/* QUICK ACTION STATE */}
              {activeTask.verificationType === "quick" && (
                <div className="flex flex-col items-center py-4">
                  {modalStage === "start" && (
                    <button 
                      onClick={handleQuickAction}
                      className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-md transition-colors flex items-center justify-center gap-2"
                    >
                      <ZapIcon className="w-5 h-5" /> Tap to Start Action
                    </button>
                  )}
                  {modalStage === "confirm_quick" && (
                     <div className="w-full">
                       <div className="p-4 bg-orange-50 border border-orange-100 rounded-xl mb-4 flex gap-3 text-orange-800">
                         <AlertCircle className="w-5 h-5 shrink-0" />
                         <p className="text-sm font-semibold">Did you actually do this? A true eco-warrior acts with integrity.</p>
                       </div>
                       <button 
                        onClick={() => submitVerification()}
                        className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-md transition-colors"
                      >
                         Yes, I did it!
                      </button>
                     </div>
                  )}
                </div>
              )}

              {/* PROOF STATE */}
              {activeTask.verificationType === "proof" && (
                <div className="flex flex-col py-2">
                  {modalStage === "start" && (
                    <>
                      <p className="text-sm text-slate-600 font-medium mb-3">Provide a short comment or photo proof of your task:</p>
                      <textarea
                        value={proofText}
                        onChange={(e) => setProofText(e.target.value)}
                        placeholder="e.g. I turned off the living room AC before leaving..."
                        className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50 focus:bg-white transition-colors h-24 resize-none mb-4"
                      />
                      <div className="flex gap-3">
                         <button 
                           onClick={() => showAlert({ type: "info", message: "Photo uploads coming soon! Use text for now." })}
                           className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors flex items-center justify-center gap-2 text-sm"
                         >
                           <Camera className="w-4 h-4" /> Add Photo
                         </button>
                         <button 
                           onClick={() => submitVerification()}
                           disabled={proofText.trim().length < 5}
                           className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                         >
                           Submit Proof
                         </button>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* QUIZ STATE */}
              {activeTask.verificationType === "quiz" && quizData && (
                <div className="flex flex-col py-2">
                  {modalStage === "start" || modalStage === "wrong" ? (
                    <>
                      <div className="mb-4">
                        <span className="flex items-center gap-2 text-sm font-bold text-indigo-600 mb-2">
                           <BookOpen className="w-4 h-4" /> Quick Check
                        </span>
                        <p className="text-slate-800 font-semibold">{quizData.q}</p>
                      </div>
                      <div className="grid grid-cols-1 gap-2">
                         {quizData.options.map((opt, i) => (
                           <button 
                             key={i}
                             onClick={() => {
                               if (i === quizData.ans) {
                                 submitVerification(`Quiz passed: ${opt}`);
                               } else {
                                 setModalStage("wrong");
                               }
                             }}
                             className="p-3 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:border-indigo-300 hover:bg-indigo-50 transition-colors text-left"
                           >
                             {opt}
                           </button>
                         ))}
                      </div>
                      {modalStage === "wrong" && (
                        <p className="mt-3 text-xs font-bold text-red-500 text-center animate-pulse">
                          Incorrect! Try again.
                        </p>
                      )}
                    </>
                  ) : null}
                </div>
              )}

              {/* COMMON STATES */}
              {modalStage === "verifying" && (
                <div className="flex flex-col items-center justify-center py-8">
                  <RefreshCw className="w-10 h-10 text-emerald-500 animate-spin mb-4" />
                  <p className="text-slate-600 font-bold animate-pulse">Verifying Action...</p>
                </div>
              )}
              {modalStage === "done" && (
                <div className="flex flex-col items-center justify-center py-8">
                  <motion.div 
                    initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}
                  >
                    <CheckCircle className="w-16 h-16 text-emerald-500 mb-4" />
                  </motion.div>
                  <p className="text-slate-800 font-display font-bold text-xl">Verified!</p>
                  <p className="text-emerald-600 font-bold text-sm bg-emerald-50 px-3 py-1 rounded-full mt-2">
                    {activeTask.impact} Earned
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
