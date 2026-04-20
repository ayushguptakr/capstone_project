import React, { useMemo, useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { Trophy, School, Crown, ArrowUpRight, ArrowDownRight, Clock, Flame } from "lucide-react";
import { IconBox } from "../components";
import { apiRequest } from "../api/httpClient";
import { getStoredUser } from "../utils/authStorage";

function Leaderboard() {
  const [activeTab, setActiveTab] = useState("students");
  const [globalLeaderboard, setGlobalLeaderboard] = useState([]);
  const [schoolLeaderboard, setSchoolLeaderboard] = useState([]);
  const [classLeaderboard, setClassLeaderboard] = useState([]);
  const [myLeague, setMyLeague] = useState("bronze");

  const [timeRange, setTimeRange] = useState("all");
  const [loading, setLoading] = useState(true);


  const currentUser = getStoredUser();

  // Dictionary for previous states
  const prevMapRef = useRef(new Map());

  // Polling mechanism (60s)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [studData, schData, clsData] = await Promise.all([
          apiRequest("/api/leaderboard"),
          apiRequest("/api/leaderboard/schools"),
          apiRequest("/api/leaderboard/class")
        ]);
        
        // Before updating, capture current states natively into prevMapRef
        const newMap = new Map();
        setGlobalLeaderboard(prev => {
          prev.forEach((u, i) => {
            newMap.set(String(u._id), { points: u.points, rank: i + 1 });
          });
          prevMapRef.current = newMap;
          return studData || [];
        });

        // Set league based on user data
        const currentStud = (studData || []).find(u => String(u._id) === String(currentUser?.id || currentUser?._id));
        if (currentStud?.league) {
          setMyLeague(currentStud.league);
        }

        setSchoolLeaderboard(schData || []);
        setClassLeaderboard(clsData || []);

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const inv = setInterval(fetchData, 60000); // 60s
    return () => clearInterval(inv);
  }, [currentUser]);

  // Derived filtered rows
  const filteredStudents = useMemo(() => {
    let rows = [...globalLeaderboard];
    if (timeRange === "week") {
      rows.sort((a, b) => (b.weeklyXP || 0) - (a.weeklyXP || 0));
    } else {
      rows.sort((a, b) => (b.points || 0) - (a.points || 0));
    }
    return rows;
  }, [globalLeaderboard, timeRange]);

  // Confetti trigger if rank changed massively
  useEffect(() => {
    if (filteredStudents.length === 0 || loading) return;
    const cid = String(currentUser?.id || currentUser?._id);
    const currRank = filteredStudents.findIndex(s => String(s._id) === cid) + 1;
    const prev = prevMapRef.current.get(cid);
    
    if (prev && currRank > 0) {
      if (prev.rank - currRank >= 2) {
        // Jumped 2+ ranks
        confetti({ particleCount: 120, spread: 80, y: 0.6 });
      }
    }
  }, [filteredStudents, currentUser, loading]);

  const classLabelOf = (s) => {
    const cls = s.class || s.className || "";
    const sec = s.section || "";
    return cls && sec ? `${cls}${sec}` : cls || "Class N/A";
  };

  const getPoints = (s) => timeRange === "week" ? (s.weeklyXP || 0) : (s.points || 0);

  const getDeltaMeta = (s, currRank) => {
    const prev = prevMapRef.current.get(String(s._id));
    if (!prev) return { xpGain: 0, rankDiff: 0 };
    
    const xpGain = getPoints(s) - prev.points;
    const rankDiff = prev.rank - currRank;
    return { xpGain: Math.max(0, xpGain), rankDiff };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F6FAF6] flex flex-col pt-12 px-6 max-w-6xl mx-auto space-y-4">
        {[1,2,3,4,5].map(i => (
          <div key={i} className="h-20 bg-slate-200/50 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  const listRows = filteredStudents.slice(0, 20);
  
  const myCurrentRank = filteredStudents.findIndex((s) => String(s._id) === String(currentUser?.id || currentUser?._id)) + 1;

  const tabs = [{ id: "students", label: "Students", Icon: Trophy }, { id: "schools", label: "Schools", Icon: School }];

  return (
    <div className="min-h-screen bg-[#F6FAF6] pb-32">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        
        {/* Header Strings */}
        <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="font-display font-bold text-3xl text-[#1f2d26] flex items-center gap-2">
              <IconBox color="yellow" size="sm">
                <Trophy className="w-5 h-5" strokeWidth={2} stroke="#B45309" fill="#FDE68A" />
              </IconBox>
              Global Rankings
            </h1>
            <p className="text-slate-500 mt-1 flex items-center gap-1.5 text-sm font-semibold">
              <Clock className="w-4 h-4" /> Updated just now
            </p>
          </div>

          <div className="flex gap-2 bg-white p-1 rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
            {tabs.map((t) => (
              <motion.button
                key={t.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab(t.id)}
                className={`shrink-0 px-5 py-2 rounded-xl font-bold transition-colors text-sm
                  ${activeTab === t.id ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20" : "text-slate-500 hover:bg-slate-50"}`}
              >
                <span className="inline-flex items-center gap-1.5 truncate">
                  <t.Icon className="w-4 h-4" /> {t.label}
                </span>
              </motion.button>
            ))}
          </div>
        </div>

        {activeTab === "students" ? (
          <>
            {/* Social Layers: League & Class Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
               {/* Leagues Panel */}
               <div className="rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 p-5 text-white shadow-lg relative overflow-hidden">
                 <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                 <h3 className="font-display font-bold text-xl flex items-center gap-2 mb-1">
                   <Crown className="w-6 h-6 text-yellow-300" />
                   <span className="capitalize">{myLeague} League</span>
                 </h3>
                 <p className="text-indigo-100 text-sm font-semibold mb-4">Top 5 get promoted. Ends in 2d 14h.</p>
                 
                 <div className="w-full h-2 bg-black/20 rounded-full overflow-hidden mt-2">
                    <div className="h-full bg-yellow-400 rounded-full" style={{ width: '40%' }} />
                 </div>
                 <p className="text-xs uppercase tracking-wider font-bold mt-2 text-indigo-200">
                    Need 450 XP to enter promotion zone
                 </p>
               </div>

               {/* Class vs Class Panel */}
               {classLeaderboard.length > 0 && (
                 <div className="rounded-3xl bg-white border border-emerald-100 shadow-sm p-5 relative overflow-hidden flex flex-col justify-center gap-3">
                   <h3 className="font-display font-bold text-lg text-emerald-900 mb-1 flex items-center gap-2">
                     <School className="w-5 h-5 text-emerald-500" />
                     Class Rankings
                   </h3>
                   {classLeaderboard.slice(0, 3).map((cls, idx) => (
                     <div key={idx} className="flex items-center justify-between">
                       <div className="flex items-center gap-2">
                         <span className="text-xs font-bold w-4 text-emerald-600">{idx+1}.</span>
                         <span className="font-bold text-slate-700">{cls.className || cls.school}</span>
                       </div>
                       <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg text-xs border border-emerald-100">
                         {Number(cls.totalPoints || cls.points || 0).toLocaleString()} XP
                       </span>
                     </div>
                   ))}
                   <div className="absolute right-[-2.5rem] top-[-2.5rem] w-32 h-32 bg-emerald-50 rounded-full blur-3xl pointer-events-none" />
                 </div>
               )}
            </div>

            <div className="flex flex-wrap items-center gap-2 mb-4">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-bold shadow-sm focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                <option value="all">All-Time XP</option>
                <option value="week">Weekly XP</option>
              </select>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white shadow-[0_4px_24px_rgba(0,0,0,0.02)] overflow-hidden relative">
              <div className="p-4 grid grid-cols-12 gap-4 border-b border-slate-100 bg-slate-50/50 text-xs font-bold text-slate-400 uppercase tracking-wider">
                 <div className="col-span-2 sm:col-span-1 text-center">Rank</div>
                 <div className="col-span-8 sm:col-span-8">Eco Hero</div>
                 <div className="col-span-2 sm:col-span-3 text-right">Points</div>
              </div>
              
              <div className="flex flex-col relative z-0">
                {listRows.map((s, i) => {
                  const rank = i + 1;
                  const pts = getPoints(s);
                  const meta = getDeltaMeta(s, rank);
                  const isMe = String(s._id) === String(currentUser?.id || currentUser?._id);

                  // Row Styling based on Rank
                  let rowBg = "bg-white hover:bg-slate-50";
                  let rankColor = "text-slate-400 bg-slate-100";
                  let medal = null;

                  if (rank === 1) {
                    rowBg = "bg-gradient-to-r from-amber-50/50 to-yellow-50 overflow-hidden";
                    rankColor = "bg-yellow-400 text-yellow-900 shadow-md shadow-yellow-400/40 border border-yellow-200";
                    medal = "🥇";
                  } else if (rank === 2) {
                    rowBg = "bg-slate-50 hover:bg-slate-100/80";
                    rankColor = "bg-slate-300 text-slate-800 shadow-sm border border-slate-200";
                    medal = "🥈";
                  } else if (rank === 3) {
                    rowBg = "bg-orange-50/40 hover:bg-orange-50/70";
                    rankColor = "bg-orange-300 text-orange-900 shadow-sm border border-orange-200";
                    medal = "🥉";
                  } else if (isMe) {
                    rowBg = "bg-emerald-50/50 border border-emerald-100";
                  }

                  return (
                     <motion.div
                       layout
                       transition={{ type: "spring", stiffness: 300, damping: 30 }}
                       key={s._id}
                       whileHover={{ scale: 1.015, y: -2, zIndex: 10, boxShadow: "0 10px 30px -10px rgba(0,0,0,0.1)" }}
                       className={`grid grid-cols-12 gap-4 items-center p-3 sm:px-4 sm:py-4 border-b border-slate-100 last:border-0 relative ${rowBg}`}
                     >
                        {/* Glow for rank 1 */}
                        {rank === 1 && (
                          <motion.div 
                            animate={{ opacity: [0.5, 0.8, 0.5] }} 
                            transition={{ repeat: Infinity, duration: 2 }} 
                            className="absolute inset-0 bg-yellow-400/5 pointer-events-none" 
                          />
                        )}

                        <div className="col-span-2 sm:col-span-1 flex justify-center relative">
                           <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-display font-bold text-sm z-10 ${rankColor}`}>
                              {medal ? <span className="text-lg">{medal}</span> : rank}
                           </div>
                        </div>

                        <div className="col-span-8 sm:col-span-8 flex items-center gap-3 sm:gap-4 relative z-10">
                           <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center text-white font-bold shrink-0 shadow-inner 
                              ${rank === 1 ? 'bg-gradient-to-br from-amber-400 to-yellow-500' : 'bg-slate-200 text-slate-600'}`}>
                              {s.name?.[0]?.toUpperCase()}
                           </div>
                           <div className="flex flex-col flex-1 min-w-0">
                              <span className="font-display font-bold text-slate-900 text-base sm:text-lg truncate flex items-center gap-2">
                                {s.name}
                                {isMe && <span className="px-2 py-0.5 rounded-md text-[10px] sm:text-xs bg-emerald-500 text-white font-bold shadow-sm">YOU</span>}
                                {s.streakCurrent > 2 && <span className="inline-flex items-center text-[10px] font-bold text-orange-500"><Flame className="w-3 h-3" fill="currentColor"/> {s.streakCurrent}</span>}
                              </span>
                              <span className="text-xs font-semibold text-slate-500 truncate">
                                Lvl {s.level} • {classLabelOf(s)}
                              </span>
                           </div>
                        </div>

                        <div className="col-span-2 sm:col-span-3 flex flex-col items-end justify-center relative z-10">
                           <span className={`font-display font-bold leading-none ${rank === 1 ? 'text-amber-600 text-2xl sm:text-3xl' : 'text-slate-700 text-xl sm:text-2xl'}`}>
                              {pts.toLocaleString()}
                           </span>
                           <span className="text-[10px] sm:text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">XP</span>
                           
                           {/* XP Gain Bubble (AnimatePresence maps the diff safely) */}
                           <AnimatePresence>
                             {meta.xpGain > 0 && (
                               <motion.div
                                 initial={{ opacity: 0, y: 10, scale: 0.5 }}
                                 animate={{ opacity: 1, y: -25, scale: 1 }}
                                 exit={{ opacity: 0 }}
                                 transition={{ duration: 1.2, ease: "easeOut" }}
                                 className="absolute right-0 top-0 pointer-events-none whitespace-nowrap"
                               >
                                 <span className="text-xs font-bold text-emerald-500 drop-shadow-sm bg-white/70 px-1 py-0.5 border border-emerald-100 rounded">+{meta.xpGain} XP</span>
                               </motion.div>
                             )}
                           </AnimatePresence>

                           {/* Movement Tag */}
                           {meta.rankDiff > 0 && <div className="absolute right-full mr-4 flex items-center gap-0.5 text-xs font-bold text-emerald-500"><ArrowUpRight className="w-3.5 h-3.5"/>{meta.rankDiff}</div>}
                           {meta.rankDiff < 0 && <div className="absolute right-full mr-4 flex items-center gap-0.5 text-xs font-bold text-rose-500"><ArrowDownRight className="w-3.5 h-3.5"/>{Math.abs(meta.rankDiff)}</div>}
                        </div>
                     </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Ghost Row Logic */}
            {myCurrentRank > 20 && (
              <div className="sticky bottom-6 mt-6 z-50">
                 <div className="absolute inset-[-10px] bg-gradient-to-t from-white via-white to-transparent pointer-events-none" />
                 <motion.div 
                   initial={{ y: 50, opacity: 0 }}
                   animate={{ y: 0, opacity: 1 }}
                   className="relative flex items-center gap-4 bg-emerald-700 text-white p-4 rounded-3xl shadow-[0_20px_40px_-15px_rgba(5,150,105,0.4)] border-2 border-emerald-400"
                 >
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-display font-bold">
                       {myCurrentRank}
                    </div>
                    <div className="flex-1">
                       <span className="font-display font-bold text-lg inline-flex items-center gap-2">
                         {currentUser?.name} <span className="bg-white text-emerald-700 px-2 rounded font-bold text-xs uppercase tracking-widest">You</span>
                       </span>
                    </div>
                    <div className="text-right">
                       <span className="font-display font-bold text-2xl">{getPoints(filteredStudents[myCurrentRank-1] || {}).toLocaleString()}</span>
                    </div>
                 </motion.div>
              </div>
            )}
          </>
        ) : (
          <div className="space-y-4">
            {schoolLeaderboard.map((s, i) => (
              <motion.div
                key={s.school || i}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-4 p-5 rounded-3xl bg-white border border-slate-200 shadow-sm"
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg ${i < 3 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>{i + 1}</div>
                <div className="flex-1">
                  <div className="font-display font-bold text-xl text-slate-800">{s.school}</div>
                  <div className="text-sm font-semibold text-slate-500">{s.studentCount} students actively competing</div>
                </div>
                <span className="font-display font-bold text-2xl text-eco-primary">{Number(s.totalPoints || 0).toLocaleString()} XP</span>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Leaderboard;
