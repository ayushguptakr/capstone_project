import React from "react";
import { motion } from "framer-motion";
import { Star, Lock, BookOpen } from "lucide-react";
import { Badge, IconBox } from "../../components";

export default function QuizCardEnhanced({ quiz, progress, isLocked, onPlay }) {
  const stars = progress?.stars || 0;
  const bestScore = progress?.bestScore || 0;
  
  let layoutState = "not-started";
  if (stars === 3) layoutState = "mastered";
  else if (progress?.attempts > 0) layoutState = "in-progress";

  const statusColors = {
    "not-started": "border-slate-200 bg-white",
    "in-progress": "border-amber-200 bg-amber-50/30",
    "mastered": "border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50",
  };

  const getStatusText = () => {
    if (isLocked) return "Locked 🔒";
    if (layoutState === "mastered") return "Mastered ⭐⭐⭐";
    if (layoutState === "in-progress") return "In Progress 🔄";
    return "Not Started";
  };

  const scheduleStatus = quiz?.schedule?.status || "unscheduled";
  const scheduleText =
    scheduleStatus === "upcoming"
      ? "Opens Soon"
      : scheduleStatus === "closed"
        ? "Closed"
        : scheduleStatus === "active"
          ? "Scheduled"
          : "Live";
  const scheduleClass =
    scheduleStatus === "upcoming"
      ? "bg-blue-100 text-blue-700"
      : scheduleStatus === "closed"
        ? "bg-rose-100 text-rose-700"
        : scheduleStatus === "active"
          ? "bg-indigo-100 text-indigo-700"
          : "bg-emerald-100 text-emerald-700";
  const unavailableBySchedule = quiz?.isAvailableNow === false;

  return (
    <motion.div
      whileHover={isLocked || unavailableBySchedule ? {} : { scale: 1.02, y: -4 }}
      whileTap={isLocked || unavailableBySchedule ? {} : { scale: 0.98 }}
      onClick={() => { if (!isLocked && !unavailableBySchedule) onPlay(quiz._id); }}
      className={`relative rounded-3xl p-5 shadow-sm border-2 ${isLocked || unavailableBySchedule ? 'border-slate-100 bg-slate-50 opacity-75 grayscale-[0.3]' : statusColors[layoutState]} cursor-pointer transition-all hover:shadow-lg`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <IconBox color={isLocked ? "gray" : (stars === 3 ? "gold" : "blue")} size="md" className="rounded-2xl">
            {isLocked ? <Lock className="w-6 h-6" /> : <BookOpen className="w-6 h-6" />}
          </IconBox>
          <div>
            <h3 className="font-bold text-slate-800 leading-tight">{quiz.title}</h3>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{getStatusText()}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={isLocked ? "default" : (quiz.difficulty || "easy").toLowerCase()}>{quiz.difficulty || "Easy"}</Badge>
          <span className={`text-[11px] font-bold px-2 py-1 rounded-full ${scheduleClass}`}>{scheduleText}</span>
        </div>
      </div>

      <p className="text-slate-500 text-sm mb-5 line-clamp-2 leading-relaxed">{quiz.description}</p>
      
      <div className="flex items-center justify-between mt-auto">
        <div className="flex gap-1">
          {[0,1,2].map(i => (
            <Star key={i} className={`w-4 h-4 ${i < stars ? 'fill-amber-400 text-amber-500' : 'fill-slate-100 text-slate-200'}`} />
          ))}
        </div>
        <div className="flex flex-col items-end">
          <span className="text-xs font-bold text-slate-400">BEST SCORE</span>
          <span className={`text-sm font-black ${bestScore > 0 ? 'text-indigo-600' : 'text-slate-300'}`}>
            {bestScore > 0 ? `${bestScore} XP` : '---'}
          </span>
        </div>
      </div>
      
      {layoutState === "mastered" && (
        <div className="absolute top-0 right-0 -mr-2 -mt-2">
          <div className="w-6 h-6 rounded-full bg-amber-400 flex items-center justify-center shadow-md">
            <Star className="w-3 h-3 text-white fill-white" />
          </div>
        </div>
      )}
    </motion.div>
  );
}
