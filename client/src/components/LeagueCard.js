import React from "react";
import { motion } from "framer-motion";
import { Trophy, ChevronUp, ChevronDown, Minus, Shield, Crown, Gem, Medal } from "lucide-react";

const LEAGUES = [
  { id: "bronze", label: "Bronze", color: "from-amber-600 to-amber-800", text: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200", icon: Medal, minXP: 0 },
  { id: "silver", label: "Silver", color: "from-slate-400 to-slate-600", text: "text-slate-600", bg: "bg-slate-50", border: "border-slate-200", icon: Shield, minXP: 200 },
  { id: "gold", label: "Gold", color: "from-yellow-400 to-amber-500", text: "text-yellow-700", bg: "bg-yellow-50", border: "border-yellow-200", icon: Crown, minXP: 500 },
  { id: "diamond", label: "Diamond", color: "from-sky-400 to-indigo-500", text: "text-indigo-600", bg: "bg-indigo-50", border: "border-indigo-200", icon: Gem, minXP: 1000 },
];

/**
 * LeagueCard — Compact league status widget.
 * Props: league (string), weeklyXP (number)
 */
export default function LeagueCard({ league = "bronze", weeklyXP = 0 }) {
  const currentIdx = LEAGUES.findIndex(l => l.id === league);
  const current = LEAGUES[currentIdx] || LEAGUES[0];
  const next = LEAGUES[currentIdx + 1];
  const Icon = current.icon;

  // Progress to next league
  const progressXP = next ? weeklyXP - current.minXP : weeklyXP;
  const neededXP = next ? next.minXP - current.minXP : 1;
  const progressPct = next ? Math.min(100, Math.round((progressXP / neededXP) * 100)) : 100;

  // Promotion/demotion status
  const isPromoting = next && weeklyXP >= next.minXP;
  const isDemoting = currentIdx > 0 && weeklyXP < current.minXP * 0.5;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl p-4 border ${current.border} ${current.bg} transition-all`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${current.color} flex items-center justify-center shadow-md`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className={`font-display font-bold text-sm ${current.text}`}>{current.label} League</p>
            <p className="text-[11px] text-slate-500 font-medium">
              {weeklyXP} XP this week
            </p>
          </div>
        </div>

        {/* Status badge */}
        {isPromoting ? (
          <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center gap-1">
            <ChevronUp className="w-3 h-3" /> Promoting
          </span>
        ) : isDemoting ? (
          <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-lg bg-red-100 text-red-700 border border-red-200 flex items-center gap-1">
            <ChevronDown className="w-3 h-3" /> At Risk
          </span>
        ) : (
          <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-lg bg-slate-100 text-slate-500 border border-slate-200 flex items-center gap-1">
            <Minus className="w-3 h-3" /> Holding
          </span>
        )}
      </div>

      {/* Progress bar */}
      {next && (
        <div>
          <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-1.5">
            <span>{current.label}</span>
            <span>{next.label} ({next.minXP} XP)</span>
          </div>
          <div className="h-2 bg-white rounded-full overflow-hidden border border-slate-200">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className={`h-full rounded-full bg-gradient-to-r ${current.color}`}
            />
          </div>
        </div>
      )}

      {!next && (
        <p className="text-[11px] text-center text-indigo-500 font-semibold mt-1">
          🏆 You've reached the highest league!
        </p>
      )}
    </motion.div>
  );
}
