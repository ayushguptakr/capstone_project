import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame } from "lucide-react";

export default function StreakCalendar({ streak = 0 }) {
  // Generate the last 7 days window retroactively
  const days = [];
  const today = new Date();
  
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    // If streak is 5, it means the last 5 days (i=0 to 4) are completed.
    const completed = i < streak; 
    
    days.push({
      dateObj: d,
      completed,
      isToday: i === 0,
      id: d.toISOString().split("T")[0] // Unique string for animation
    });
  }

  return (
    <div className="bg-white rounded-2xl px-5 sm:px-6 shadow-[0_4px_24px_rgba(0,0,0,0.03)] border border-gray-100 h-[72px] flex items-center justify-between hover:shadow-[0_4px_30px_rgba(0,0,0,0.06)] transition-all">
      {/* Left Axis: Streak Tag */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-orange-50 border border-orange-100 shadow-inner shrink-0">
          <Flame className="w-5 h-5 text-orange-500" strokeWidth={2.5} />
        </div>
        <div className="flex flex-col">
          <span className="font-display font-bold text-[#2D332F] text-sm leading-tight group-hover:text-orange-600 transition-colors">
            {streak} Day Streak
          </span>
          <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Habit Loop</span>
        </div>
      </div>

      {/* Right Axis: Dots */}
      <div className="flex items-center gap-1.5 sm:gap-2.5">
        <AnimatePresence>
          {days.map((day, idx) => {
            const dayNameFull = new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(day.dateObj);
            const tooltipText = day.completed ? `Completed on ${dayNameFull}` : `Missed on ${dayNameFull}`;
            
            return (
              <div 
                key={day.id} 
                title={tooltipText}
                className="relative group cursor-default flex items-center justify-center p-1"
              >
                <motion.div
                  initial={day.completed ? { scale: 0, opacity: 0 } : false}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: day.completed ? idx * 0.05 : 0, type: "spring", stiffness: 300, damping: 20 }}
                  className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${
                    day.completed 
                      ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] group-hover:bg-emerald-400" 
                      : "bg-slate-200 group-hover:bg-slate-300"
                  } ${
                    day.isToday && day.completed 
                      ? "ring-[2.5px] ring-emerald-300 ring-offset-2" 
                      : day.isToday && !day.completed 
                        ? "ring-[2.5px] ring-slate-300 ring-offset-2" 
                        : ""
                  }`}
                />
                
                {/* Tooltip Hover Bubble (Optional detail) */}
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-2 py-1 text-[10px] font-bold text-white bg-slate-800 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                  {tooltipText}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800" />
                </span>
              </div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
