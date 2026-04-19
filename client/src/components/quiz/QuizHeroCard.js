import React from "react";
import { motion } from "framer-motion";
import { Play, Star, BookOpen, Clock, Flame } from "lucide-react";
import { Badge } from "../../components";

const QuizProgressBar = ({ max, current, stars }) => {
  const percent = max > 0 ? Math.min(100, Math.round((current / max) * 100)) : 0;
  return (
    <div className="w-full mt-4">
      <div className="flex justify-between text-xs font-bold text-slate-500 mb-1.5 px-0.5">
        <span className="text-indigo-600">Progress</span>
        <span>{Math.max(0, percent)}%</span>
      </div>
      <div className="h-2 w-full bg-indigo-100 rounded-full overflow-hidden flex">
        <motion.div 
          initial={{ width: 0 }} 
          animate={{ width: `${percent}%` }}
          className="h-full bg-gradient-to-r from-indigo-500 to-indigo-400"
        />
      </div>
    </div>
  );
};

export default function QuizHeroCard({ quiz, progress, label = "Recommended", onPlay }) {
  if (!quiz) return null;
  
  const stars = progress?.stars || 0;
  const btnText = progress?.attempts > 0 ? "Continue" : "Start Learning";
  
  return (
    <div className="relative">
      <div className="absolute -top-3 left-4 px-3 py-1 bg-amber-500 text-white text-[10px] uppercase tracking-wider font-extrabold rounded-full shadow-sm z-10 flex items-center gap-1">
        <Flame className="w-3 h-3" /> {label}
      </div>
      
      <motion.div 
        whileHover={{ scale: 1.01, y: -2 }}
        className="w-full bg-white rounded-3xl p-6 sm:p-8 shadow-card border-2 border-indigo-50 relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
      >
        <div className="absolute top-0 right-0 p-32 bg-indigo-50 rounded-full blur-[80px] -z-0 opacity-60 translate-x-10 -translate-y-10 pointer-events-none" />
        
        <div className="relative z-10 flex-1 w-full">
          <div className="flex gap-2 items-center mb-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <Badge variant={(quiz.difficulty || "medium").toLowerCase()}>{quiz.difficulty || "Medium"}</Badge>
          </div>
          
          <h2 className="font-display font-black text-2xl sm:text-3xl text-slate-800 mb-2">{quiz.title}</h2>
          <p className="text-slate-500 text-sm max-w-sm mb-4 leading-relaxed">{quiz.description}</p>
          
          <QuizProgressBar max={quiz.totalPoints || 100} current={progress?.bestScore || 0} stars={stars} />
        </div>
        
        <div className="relative z-10 flex flex-col items-center gap-3 w-full sm:w-auto">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onPlay(quiz._id)}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-500 text-white font-bold shadow-lg shadow-indigo-200 hover:shadow-xl transition-shadow flex items-center justify-center gap-2"
          >
            <Play className="w-5 h-5 fill-white" /> {btnText}
          </motion.button>
          
          {progress?.attempts > 0 && (
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
               Last played: {new Date(progress.lastPlayedAt).toLocaleDateString()}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
