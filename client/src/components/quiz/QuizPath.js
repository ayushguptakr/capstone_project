import React from "react";
import { motion } from "framer-motion";
import { Star, Check, Lock } from "lucide-react";

export default function QuizPath({ quizzes, userProgress, onPlay }) {
  // If there are no quizzes, return null
  if (!quizzes || quizzes.length === 0) return null;

  return (
    <div className="py-6 px-2 w-full max-w-[280px] mx-auto">
      <div className="relative flex flex-col items-center gap-6">
        
        {/* The central backbone line connecting the nodes */}
        <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-2 bg-slate-100 rounded-full z-0" />
        
        {quizzes.map((quiz, index) => {
          const progress = userProgress[quiz.slug || quiz._id];
          const prevProgress = index > 0 ? userProgress[quizzes[index - 1].slug || quizzes[index - 1]._id] : null;
          
          const isLocked = index > 0 && (!prevProgress || prevProgress.stars < 1);
          const isMastered = progress?.stars === 3;
          const isCompleted = progress?.stars > 0 && !isMastered;
          
          // Identify the single "current" active node
          // That is: the first quiz that is NOT mastered or the very first incomplete one
          const isCurrent = !isLocked && !isMastered && (!progress || progress.stars < 3);

          let nodeStyle = "bg-white border-slate-200 text-slate-400";
          if (isMastered) nodeStyle = "bg-amber-400 border-amber-500 text-white shadow-lg shadow-amber-200/50";
          else if (isCompleted) nodeStyle = "bg-emerald-400 border-emerald-500 text-white shadow-lg shadow-emerald-200/50";
          else if (isCurrent) nodeStyle = "bg-indigo-500 border-indigo-600 text-white shadow-xl shadow-indigo-300 ring-4 ring-indigo-100";
          else if (isLocked) nodeStyle = "bg-slate-100 border-slate-200 text-slate-300";

          // Calculate offset to create a slightly winding path (zig-zag horizontally)
          const isEven = index % 2 === 0;
          const xOffset = isEven ? -25 : 25; 

          return (
            <div key={quiz._id} className="relative z-10 flex flex-col items-center group w-full">
              <motion.button
                whileHover={isLocked ? {} : { scale: 1.1 }}
                whileTap={isLocked ? {} : { scale: 0.95 }}
                onClick={() => { if (!isLocked) onPlay(quiz._id); }}
                style={{ x: xOffset }}
                className={`relative w-16 h-16 rounded-full border-b-4 flex items-center justify-center transition-all cursor-${isLocked ? 'not-allowed' : 'pointer'} ${nodeStyle} ${(!isCurrent && !isLocked) ? 'opacity-80 hover:opacity-100' : ''}`}
              >
                {isLocked ? (
                  <Lock className="w-6 h-6 opacity-60" />
                ) : isMastered ? (
                  <Star className="w-7 h-7 fill-white" />
                ) : isCompleted ? (
                  <Check className="w-7 h-7 stroke-[3]" />
                ) : (
                  <Star className="w-7 h-7 opacity-90" />
                )}
                
                {/* 1, 2, 3 small floating star indicators (Only if completed but not fully mastered) */}
                {(isCompleted || isCurrent) && progress?.stars > 0 && !isMastered && (
                  <div className="absolute -top-3 px-2 py-0.5 bg-white border border-slate-200 rounded-full shadow-sm flex items-center gap-0.5">
                    {[0,1,2].map(i => (
                      <Star key={i} className={`w-2.5 h-2.5 ${i < progress.stars ? 'fill-amber-400 text-amber-500' : 'fill-slate-100 text-slate-200'}`} />
                    ))}
                  </div>
                )}
              </motion.button>

              <motion.div style={{ x: xOffset }} className="mt-2 text-center max-w-[120px]">
                <h4 className={`text-xs font-bold leading-tight ${isCurrent ? 'text-indigo-600' : isLocked ? 'text-slate-400' : 'text-slate-600'}`}>
                  {quiz.title}
                </h4>
              </motion.div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
