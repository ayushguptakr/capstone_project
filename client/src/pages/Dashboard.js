import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  Brain,
  Gamepad2,
  ShoppingBag,
  Trophy,
  Plus,
  BarChart3,
  Globe,
  BookOpen,
  Eye,
  Flame,
  MapPin,
  Droplet,
  Leaf,
  Zap,
  Play,
  Medal,
  CheckCircle2,
  TrendingUp,
  Recycle,
  CheckCircle,
  TreePine,
  Crown,
  Sparkles,
  Award,
  Shield,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Hand,
  Sprout,
  Star,
  } from "lucide-react";
import { EcoLoader } from "../components";
import SproutyCard from "../components/SproutyCard";
import EcoPlant from "../components/EcoPlant";
import DailyEcoPlan from "../components/DailyEcoPlan";
import StreakCalendar from "../components/StreakCalendar";
import LeagueCard from "../components/LeagueCard";
import useFeedback from "../hooks/useFeedback";
import useSound from "../hooks/useSound";
import { fetchGamificationMe } from "../api/gamificationApi";
import { apiRequest } from "../api/httpClient";
import useProgressionEngine from "../hooks/useProgressionEngine";
import { useAuth } from "../context/AuthContext";
import confetti from "canvas-confetti";

export const fireConfetti = () => {
  confetti({
    particleCount: 80,
    spread: 70,
    origin: { y: 0.6 }
  });
};

function getLevel(points) {
  if (points < 100) return { name: "Beginner", next: 100 };
  if (points < 500) return { name: "Eco Scholar", next: 500 };
  if (points < 1500) return { name: "Eco Hero", next: 1500 };
  return { name: "Eco Champion", next: Infinity };
}

function timeAgo(iso) {
  if (!iso) return "";
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  if (s < 172800) return "1d ago";
  return `${Math.floor(s / 86400)}d ago`;
}



function CountUpNumber({ to, duration = 900, format }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (typeof to !== "number" || Number.isNaN(to)) return;
    let raf = 0;
    const start = performance.now();
    const from = 0;

    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      // Smooth ease-out for a premium feel.
      const eased = 1 - Math.pow(1 - t, 3);
      const val = from + (to - from) * eased;
      setDisplay(Math.round(val));
      if (t < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to, duration]);

  return format ? format(display) : display.toLocaleString();
}

function formatCountdown(totalSeconds) {
  const s = Math.max(0, totalSeconds);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m ${sec.toString().padStart(2, "0")}s`;
}

function Dashboard() {
  const navigate = useNavigate();
  const { triggerXPFromEvent, triggerLevelUp, triggerSuccess } =
    useFeedback();
  const { playClick } = useSound();
  const { user } = useAuth();
  const [ecoReport, setEcoReport] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [weakCategory, setWeakCategory] = useState(null);
  const [meProfile, setMeProfile] = useState(null);
  const [progress, setProgress] = useState(null);
  const [streak, setStreak] = useState(0);
  const [attempts, setAttempts] = useState([]);
  const [mySubs, setMySubs] = useState([]);
  const [gamificationSummary, setGamificationSummary] = useState(null);
  const [gamificationEvents, setGamificationEvents] = useState([]);
  const [activeBadge, setActiveBadge] = useState(null);
  const [dailySecondsLeft, setDailySecondsLeft] = useState(6 * 60 * 60);
  const [activeSchoolEvents, setActiveSchoolEvents] = useState([]);
  const [typedGreeting, setTypedGreeting] = useState("");
  const [levelFlash, setLevelFlash] = useState(false);
  const prevLevelRef = useRef(null);
  const missionsRef = useRef(null);
  const [prevBadges, setPrevBadges] = useState([]);

  // Redirect if not authenticated (belt-and-suspenders with RequireAuth)
  useEffect(() => {
    if (!user) {
      navigate("/login", { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    setStreak(parseInt(localStorage.getItem("ecoStreak") || "0", 10));
  }, []);

  useEffect(() => {
    if (user?.badges) {
      const newBadge = user.badges.find(
        (b) => !prevBadges.includes(b)
      );

      if (newBadge && prevBadges.length !== 0) {
        fireConfetti();
      }

      setPrevBadges(user.badges);
    }
  }, [user?.badges, prevBadges]);

  useEffect(() => {
    const onStreakUpdate = (event) => {
      const next = Number(event?.detail?.streak || 0);
      setStreak(next);
    };
    window.addEventListener("ecoquest:streak-updated", onStreakUpdate);
    return () => window.removeEventListener("ecoquest:streak-updated", onStreakUpdate);
  }, []);

  const [nudge, setNudge] = useState(null);
  const hasFetchedNudge = useRef(false);
  
  useEffect(() => {
    if (user?.role !== "student" || hasFetchedNudge.current) return;
    hasFetchedNudge.current = true;

    let isFetching = false;
    const fetchNudge = async () => {
      if (isFetching) return;
      isFetching = true;
      try {
        console.log("Nudge API called");
        const data = await apiRequest("/api/gamification/nudge");
        if (data?.nudge) {
          setNudge(data.nudge);
        }
      } catch (error) {
        // Safe catch
      } finally {
        isFetching = false;
      }
    };

    fetchNudge();
  }, [user?.role]);

  // Main data fetch — runs once on mount, guarded by user check.
  // Dependency is [] (empty), NOT [user], to prevent infinite re-fetches
  // from object reference changes.
  const hasFetchedData = useRef(false);
  useEffect(() => {
    if (!user || hasFetchedData.current) return;
    hasFetchedData.current = true;
    const fetchData = async () => {
      try {
        const [reportData, recData, weakData, meData, gamificationRes] = await Promise.all([
          apiRequest("/api/green-credits/report"),
          apiRequest("/api/recommendations/tasks?limit=3"),
          apiRequest("/api/recommendations/weak-category"),
          apiRequest("/api/auth/me"),
          fetchGamificationMe({ limit: 8, offset: 0 }).catch(() => null),
        ]);
        setEcoReport(reportData);
        setRecommendations(recData?.recommendations || []);
        setWeakCategory(weakData?.weakCategory || null);
        if (meData?.user) {
          setMeProfile(meData.user);
          setStreak(Number(meData.user.streakCurrent || 0));
          localStorage.setItem("ecoStreak", String(Number(meData.user.streakCurrent || 0)));
        }
        if (gamificationRes) {
          const gamificationData = gamificationRes;
          setGamificationSummary(gamificationData?.summary || null);
          setGamificationEvents(Array.isArray(gamificationData?.events) ? gamificationData.events : []);
          if (gamificationData?.summary?.streakCurrent != null) {
            const s = Number(gamificationData.summary.streakCurrent || 0);
            setStreak(s);
            localStorage.setItem("ecoStreak", String(s));
          }
        }
        if (user.role === "student") {
          const [progressData, attemptsData, submissionsData, schoolEventsData] = await Promise.all([
            apiRequest("/api/leaderboard/progress"),
            apiRequest("/api/quizzes/attempts/my"),
            apiRequest("/api/submissions/my"),
            apiRequest("/api/events").catch(()=>({events: []}))
          ]);
          setProgress(progressData);
          setAttempts(attemptsData);
          setMySubs(submissionsData);
          setActiveSchoolEvents(schoolEventsData?.events || []);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!activeBadge) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") setActiveBadge(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeBadge]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setDailySecondsLeft((s) => (s <= 0 ? 0 : s - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const missionsDone = progress?.taskStats?.approvedSubmissions ?? 0;
  const quizzesAced = useMemo(
    () => attempts.filter((a) => a.percentage === 100).length,
    [attempts]
  );

  // ── Unified Progression Engine ──
  const engine = useProgressionEngine({
    user,
    progress,
    meProfile,
    gamificationSummary,
    streak,
    recommendations,
    missionsDone,
  });

  const { points, levelNum, xpToNext, pct, ecoScore, rank, league, weeklyXP,
          missionsPending, streakAtRisk, plantStage, sproutyContext,
          diffs, commitState, hydrated } = engine;

  const level = getLevel(points);
  const impact = ecoReport?.impactSummary || {};

  // Commit previous state snapshot after each data cycle
  useEffect(() => {
    if (points > 0 || rank) commitState();
  }, [points, rank, streak, levelNum, league, commitState]);

  // System sync — trigger animations from diffs
  useEffect(() => {
    if (!hydrated) return;
    if (diffs.rankJumped) {
      fireConfetti();
    }
  }, [diffs, hydrated]);

  useEffect(() => {
    if (prevLevelRef.current == null) {
      prevLevelRef.current = levelNum;
      return;
    }
    if (levelNum > prevLevelRef.current) {
      triggerLevelUp();
      setLevelFlash(true);
      window.setTimeout(() => setLevelFlash(false), 900);
    }
    prevLevelRef.current = levelNum;
  }, [levelNum, triggerLevelUp]);

  const recentActivity = useMemo(() => {
    const icons = [BarChart3, TreePine, Droplet, Shield];
    const rows = [];
    for (const a of attempts) {
      const t = a.completedAt || a.createdAt;
      rows.push({
        key: `q-${a._id}`,
        title: a.quiz?.title || "Quiz",
        sub: timeAgo(t),
        pts: a.totalScore ?? 0,
        t: new Date(t).getTime(),
        Icon: icons[rows.length % icons.length],
      });
    }
    for (const s of mySubs) {
      const t = s.createdAt || s.updatedAt;
      rows.push({
        key: `s-${s._id}`,
        title: s.task?.title || "Eco mission",
        sub: timeAgo(t),
        pts: s.task?.points ?? 0,
        t: new Date(t).getTime(),
        Icon: icons[rows.length % icons.length],
      });
    }
    for (const evt of gamificationEvents) {
      const t = evt.occurredAt || evt.createdAt;
      const source = String(evt.source || "").toLowerCase();
      rows.push({
        key: `g-${evt._id}`,
        title: source === "bonus" ? "Bonus XP awarded" : `${source || "Activity"} XP`,
        sub: timeAgo(t),
        pts: Number(evt.points || 0),
        t: new Date(t).getTime(),
        Icon: Zap,
      });
    }
    rows.sort((a, b) => b.t - a.t);
    return rows.slice(0, 4);
  }, [attempts, mySubs, gamificationEvents]);

  const badgeDefs = useMemo(() => {
    const unlockedBadges = user?.badges || [];
    const has = (id) => unlockedBadges.includes(id);

    const ALL_BADGES = [
      {
        id: "QUIZ_CHAMP",
        title: "Quiz Champ",
        description: "Quiz Master",
        earned: has("QUIZ_CHAMP"),
        Icon: BookOpen,
        iconBg: "bg-sky-100",
        iconColor: "text-sky-600",
        textColor: "text-sky-900",
      },
      {
        id: "ECO_SCHOLAR",
        title: "Eco Scholar",
        description: "500+ XP",
        earned: has("ECO_SCHOLAR"),
        Icon: Award,
        iconBg: "bg-violet-100",
        iconColor: "text-violet-600",
        textColor: "text-violet-900",
      },
      {
        id: "ON_FIRE",
        title: "On Fire",
        description: "7-day streak",
        earned: has("ON_FIRE"),
        Icon: Flame,
        iconBg: "bg-orange-100",
        iconColor: "text-orange-600",
        textColor: "text-orange-900",
      },
      {
        id: "TREE_HUGGER",
        title: "Tree Hugger",
        description: "5+ missions",
        earned: has("TREE_HUGGER"),
        Icon: TreePine,
        iconBg: "bg-emerald-100",
        iconColor: "text-emerald-600",
        textColor: "text-emerald-900",
      },
      {
        id: "WATER_HERO",
        title: "Water Hero",
        description: "Save 100L",
        earned: has("WATER_HERO"),
        Icon: Droplet,
        iconBg: "bg-sky-100",
        iconColor: "text-sky-600",
        textColor: "text-sky-900",
      },
      {
        id: "TOP_STAR",
        title: "Top Star",
        description: "Top 3 rank",
        earned: has("TOP_STAR"),
        Icon: Crown,
        iconBg: "bg-amber-100",
        iconColor: "text-amber-600",
        textColor: "text-amber-900",
      },
    ];

    return ALL_BADGES.map(badge => ({
      ...badge,
      unlocked: unlockedBadges.includes(badge.id)
    }));
  }, [user?.badges]);

  const gameCarouselRef = useRef(null);
  const scrollGameCarousel = (dir) => {
    const el = gameCarouselRef.current;
    if (!el) return;
    el.scrollBy({
      left: dir * Math.max(320, Math.floor(el.clientWidth * 0.85)),
      behavior: "smooth",
    });
  };

  const firstName = user?.name?.split(" ")[0] || "Eco Hero";

  useEffect(() => {
    const full = "Good Evening,";
    let i = 0;
    setTypedGreeting("");
    const id = window.setInterval(() => {
      i += 1;
      setTypedGreeting(full.slice(0, i));
      if (i >= full.length) window.clearInterval(id);
    }, 38);
    return () => window.clearInterval(id);
  }, [firstName]);

  const gameLobby = useMemo(
    () => [
      {
        key: "daily-recycle",
        title: "Recycle Rush",
        description: "Today&apos;s bonus quest. Sort waste fast for extra XP.",
        rewardXp: 50,
        route: "/mini-game/waste-sorting",
        Icon: Recycle,
      },
      {
        key: "water-saver",
        title: "Water Saver",
        description: "Make smart choices to conserve water and protect ecosystems.",
        rewardXp: 18,
        route: "/mini-game/climate-hero",
        Icon: Droplet,
      },
      {
        key: "memory-garden",
        title: "Eco Memory Garden",
        description: "Match eco cards and level up your knowledge.",
        rewardXp: 22,
        route: "/mini-game/eco-memory",
        Icon: TreePine,
      },
      {
        key: "trivia-race",
        title: "Eco Trivia Race",
        description: "Answer quick questions and keep the streak alive.",
        rewardXp: 25,
        route: "/mini-game/trivia-race",
        Icon: Sparkles,
      },
      {
        key: "plant-sprint",
        title: "Plant Growth Sprint",
        description: "Grow your garden through mini challenges and earn rewards.",
        rewardXp: 20,
        route: "/mini-game/plant-growth",
        Icon: Leaf,
      },
      {
        key: "quiz-blitz",
        title: "Eco Quiz Blitz",
        description: "Speed-run quizzes and rack up XP while you learn.",
        rewardXp: 28,
        route: "/quizzes",
        Icon: BookOpen,
      },
    ],
    []
  );

  const dailyGameKey = "daily-recycle";

  const getMissionMeta = (title = "", index = 0) => {
    const t = String(title).toLowerCase();
    const iconByTitle = () => {
      if (t.includes("water") || t.includes("drop") || t.includes("river")) return Droplet;
      if (t.includes("recycle") || t.includes("waste") || t.includes("trash")) return Recycle;
      if (t.includes("tree") || t.includes("plant") || t.includes("forest")) return TreePine;
      if (t.includes("energy") || t.includes("climate") || t.includes("heat")) return Zap;
      return Shield;
    };
    const levels = ["Easy", "Medium", "Hard"];
    const difficulty = levels[index % levels.length];
    return { Icon: iconByTitle(), difficulty };
  };

  const studentQuickActions = [
    { Icon: MapPin, label: "Tasks", path: "/tasks", color: "green" },
    { Icon: Brain, label: "Quizzes", path: "/quizzes", color: "blue" },
    { Icon: Gamepad2, label: "Games", path: "/mini-games", color: "yellow" },
    { Icon: ShoppingBag, label: "Store", path: "/store", color: "green" },
    { Icon: Trophy, label: "Leaderboard", path: "/leaderboard", color: "yellow" },
    { Icon: Sparkles, label: "My Mascot", path: "/my-mascot", color: "green" },
  ];

  const teacherActions = [
    { Icon: Plus, label: "Create Task", path: "/create-task", color: "green" },
    { Icon: Brain, label: "Create Quiz", path: "/create-quiz", color: "blue" },
    { Icon: BarChart3, label: "Analytics", path: "/teacher-dashboard", color: "green" },
    { Icon: Globe, label: "Sustainability", path: "/sustainability-dashboard", color: "blue" },
    { Icon: BookOpen, label: "My Tasks", path: "/mytasks", color: "green" },
    { Icon: Eye, label: "Submissions", path: "/submissions", color: "blue" },
  ];

  if (!user) {
    return <EcoLoader />;
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#E8F5E9] via-[#F9FAF7] to-[#FFFDE7] pb-24">
      <div className="absolute inset-0 pointer-events-none z-0" aria-hidden>
        <div className="absolute -top-28 -left-28 w-96 h-96 rounded-full bg-emerald-300/25 blur-3xl" />
        <div className="absolute top-10 right-[-5rem] w-96 h-96 rounded-full bg-teal-200/18 blur-3xl" />
        <div className="absolute bottom-[-7rem] left-[-3rem] w-[30rem] h-[30rem] rounded-full bg-lime-200/15 blur-[95px]" />
      </div>



      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col lg:flex-row justify-between items-start gap-8 mb-8 w-full">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.62, ease: [0.22, 1, 0.36, 1] }}
            className="flex-1"
          >
            <h1 className="font-display font-bold text-3xl sm:text-4xl text-[#2D332F] flex flex-wrap items-center gap-2">
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35 }}>
                {typedGreeting}
              </motion.span>
              <span className="bg-gradient-to-r from-eco-primary to-[#A3E635] bg-clip-text text-transparent">
                {firstName}
              </span>
              <motion.span
                aria-hidden
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                className="inline-flex"
              >
                <Hand className="w-8 h-8 text-amber-500 transition-transform hover:scale-110" strokeWidth={2} />
              </motion.span>
            </h1>
            <p className="text-gray-600 mt-2 text-lg font-body transition-opacity duration-300 flex items-center gap-2">
              <Sprout className="w-4 h-4 text-green-500 shrink-0" strokeWidth={2} />
              {nudge ? nudge : "You're making a real impact today"}
            </p>
            <div className="mt-6 flex flex-col sm:flex-row sm:items-center gap-4">
              <button 
                onClick={() => missionsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
                className="px-6 py-3 rounded-full bg-eco-primary text-white font-bold shadow-lg shadow-eco-primary/30 hover:shadow-xl hover:-translate-y-0.5 transition-all w-fit"
              >
                Continue Today&apos;s Mission
              </button>
            </div>
          </motion.div>
          
          <div className="flex flex-col sm:flex-row lg:justify-end gap-6 items-center w-full lg:w-auto shrink-0">
             <SproutyCard 
               ecoScore={ecoScore} 
               streak={streak}
               missionsPending={missionsPending}
               level={levelNum}
               xp={points}
               contextMessage={sproutyContext}
             />
             <EcoPlant plantStage={plantStage} streakAtRisk={streakAtRisk} streak={streak} xp={points} />
          </div>
        </div>

        {user.role === "student" && (
          <>
            <div className="mb-8 w-full">
              <DailyEcoPlan streak={streak} missionsCompleted={missionsDone} level={levelNum} />
            </div>

            <div className="mb-8 w-full">
              <LeagueCard league={league} weeklyXP={weeklyXP} />
            </div>

            <motion.section
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              whileHover={{ scale: 1.01, y: -4 }}
              whileTap={{ scale: 0.97 }}
              className="rounded-3xl bg-white/40 backdrop-blur-2xl border border-white/70 shadow-[0_20px_60px_-20px_rgba(16,185,129,0.22)] p-6 sm:p-8 mb-10"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <motion.div
                    animate={levelFlash ? { scale: [1, 1.08, 1], boxShadow: ["0 10px 20px rgba(16,185,129,0.2)", "0 0 30px rgba(16,185,129,0.45)", "0 10px 20px rgba(16,185,129,0.2)"] } : {}}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                    className="w-16 h-16 rounded-full bg-gradient-to-br from-[#388E3C] to-eco-primary flex items-center justify-center text-white font-display font-bold text-2xl shadow-md shrink-0"
                  >
                    {levelNum}
                  </motion.div>
                  <div>
                    <p className="font-display font-bold text-xl text-[#2D332F]">Level {levelNum}</p>
                    <p className="text-[#5E9F57] font-semibold flex items-center gap-1">
                      {level.name}
                      <Star className="w-4 h-4 text-amber-500 transition-transform hover:scale-110" strokeWidth={2} fill="currentColor" />
                    </p>
                  </div>
                </div>
                <div className="text-right sm:text-right flex flex-col items-end gap-1">
                  <motion.div
                    animate={streak > 0 ? { scale: [1, 1.05, 1] } : {}}
                    transition={streak > 0 ? { repeat: Infinity, duration: 1.5 } : {}}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-50 border border-orange-200 rounded-full text-orange-700 text-sm font-bold shadow-sm mb-1"
                  >
                    <Flame className="w-4 h-4 text-orange-500" strokeWidth={2.5} />
                    {streak} Day Streak
                  </motion.div>
                  <p className="font-display font-bold text-lg text-[#2D332F]">{points.toLocaleString()} XP</p>
                  <p className="text-sm text-gray-500">{xpToNext.toLocaleString()} XP to next level</p>
                </div>
              </div>
              <div className="mt-6 h-4 rounded-full bg-white/30 border border-white/60 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 1.05, ease: [0.22, 1, 0.36, 1] }}
                  className="h-full rounded-full bg-gradient-to-r from-[#2F8F46] via-eco-primary to-[#95DE64] shadow-[0_0_18px_rgba(76,175,80,0.45)]"
                />
              </div>
              <p className="mt-2 text-xs text-gray-600 font-semibold">
                {xpToNext.toLocaleString()} XP needed to level up
              </p>
            </motion.section>

            <div className="mb-8 w-full">
              <StreakCalendar streak={streak} />
            </div>

            {(recommendations.length > 0 || weakCategory) && (
              <motion.section
                ref={missionsRef}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mb-10 rounded-3xl bg-white/60 backdrop-blur-3xl border-2 border-eco-primary/30 shadow-[0_0_30px_rgba(16,185,129,0.15)] p-6 sm:p-8 relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 p-4">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 text-orange-800 text-[11px] font-bold shadow-sm">
                    <Flame className="w-3.5 h-3.5 text-orange-600" strokeWidth={2} />
                    Recommended
                  </span>
                </div>
                <h2 className="font-display font-bold text-2xl text-gray-800 mb-2 flex items-center gap-2 relative z-10">
                  <MapPin className="w-6 h-6 text-eco-primary" />
                  Today&apos;s Missions
                </h2>
                {weakCategory && (
                  <p className="text-sm text-green-800 font-medium mb-4">
                    Focus area: <strong>{weakCategory}</strong>
                  </p>
                )}
                {!weakCategory && (
                  <p className="text-sm text-gray-600 mb-4 font-medium">
                    Complete these to make the highest impact today!
                  </p>
                )}
                <div className="space-y-3 relative z-10">
                  {recommendations.slice(0, 3).map((t, index) => {
                    const { Icon: MI, difficulty } = getMissionMeta(t.title, index);
                    return (
                      <motion.button
                        key={t._id}
                        type="button"
                        onClick={(e) => {
                          triggerXPFromEvent(t.points ?? 10, e);
                          navigate(`/submit/${t._id}`);
                        }}
                        whileHover={{ scale: 1.01, y: -4 }}
                        whileTap={{ scale: 0.97 }}
                        className="w-full text-left rounded-2xl bg-white border border-gray-100 shadow-md hover:shadow-xl transition-all duration-300 hover:border-eco-primary/50 px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <span className="shrink-0 w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                            <MI className="w-6 h-6 text-eco-primary" strokeWidth={2} />
                          </span>
                          <div className="flex flex-col min-w-0">
                            <span className="font-display font-bold text-lg text-gray-800 truncate">{t.title}</span>
                            <div className="flex items-center gap-3 mt-1">
                              <span
                                className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                                  difficulty === "Easy"
                                    ? "bg-emerald-50 text-emerald-700"
                                    : difficulty === "Medium"
                                      ? "bg-amber-50 text-amber-700"
                                      : "bg-red-50 text-red-700"
                                }`}
                              >
                                {difficulty}
                              </span>
                              <span className="text-eco-primary font-bold text-sm">
                                +{t.points} XP
                              </span>
                            </div>
                          </div>
                        </div>

                        <span className="shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 text-eco-primary font-bold text-sm hover:bg-eco-primary hover:text-white transition-colors border border-emerald-100">
                          Start Mission
                          <ArrowRight className="w-4 h-4" />
                        </span>
                      </motion.button>
                    );
                  })}
                </div>
              </motion.section>
            )}

            {recommendations.length === 0 && !weakCategory && (
              <motion.section
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-10 rounded-3xl bg-white/60 backdrop-blur-3xl border-2 border-emerald-200/50 shadow-[0_0_30px_rgba(16,185,129,0.15)] p-8 text-center"
              >
                <div className="flex justify-center mb-4">
                  <motion.div
                    animate={{ y: [0, -6, 0] }}
                    transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                    className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center shadow-inner"
                  >
                    <Leaf className="w-8 h-8 text-eco-primary" />
                  </motion.div>
                </div>
                <h2 className="font-display font-bold text-2xl text-gray-800 mb-2">
                  Ready to make an impact?
                </h2>
                <p className="text-gray-500 font-medium max-w-md mx-auto mb-6">
                  Start your first mission to grow your eco-impact and level up your rank.
                </p>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  onClick={() => navigate("/tasks")}
                  className="px-6 py-3 rounded-full bg-eco-primary text-white font-bold shadow-lg shadow-eco-primary/30 hover:shadow-xl transition-all"
                >
                  Explore Missions
                </motion.button>
              </motion.section>
            )}

            <motion.section
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.62, ease: [0.22, 1, 0.36, 1] }}
              className="relative isolate rounded-3xl bg-white/45 backdrop-blur-2xl border border-white/75 shadow-[0_20px_60px_-20px_rgba(16,185,129,0.22)] p-6 sm:p-8 mb-10 overflow-hidden"
            >
              <div className="absolute inset-0 pointer-events-none" aria-hidden>
                <div className="absolute -top-20 -left-24 w-80 h-80 rounded-full bg-emerald-200/20 blur-3xl" />
                <div className="absolute -bottom-28 -right-28 w-96 h-96 rounded-full bg-teal-200/15 blur-3xl" />
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-50/25 via-white/10 to-eco-pale/10" />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
              <h2 className="font-display font-bold text-xl sm:text-2xl text-[#2D332F] opacity-90 tracking-tight flex items-center gap-2">
                    <Gamepad2 className="w-5 h-5 text-gray-500" strokeWidth={2} />
                    Quick Practice
                  </h2>
                  <p className="mt-1 text-gray-500 font-body text-sm">
                    Earn bonus XP (optional)
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-200/60 bg-white/30 text-emerald-900 text-xs font-bold">
                    <Sparkles className="w-4 h-4 text-emerald-600" strokeWidth={2.2} />
                    Daily Game Challenge
                  </span>
                </div>
              </div>

              <div className="relative mt-6">
                <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-10 bg-gradient-to-r from-white/70 via-white/30 to-transparent z-10" />
                <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-white/70 via-white/30 to-transparent z-10" />

                <button
                  type="button"
                  aria-label="Scroll games left"
                  onClick={() => scrollGameCarousel(-1)}
                  className="hidden md:flex absolute left-1 top-1/2 -translate-y-1/2 z-20 h-10 w-10 items-center justify-center rounded-2xl bg-white/55 backdrop-blur-lg border border-white/70 shadow-sm hover:bg-white/80 transition cursor-pointer"
                >
                  <ChevronLeft className="w-5 h-5 text-[#2D332F]" strokeWidth={2.2} />
                </button>
                <button
                  type="button"
                  aria-label="Scroll games right"
                  onClick={() => scrollGameCarousel(1)}
                  className="hidden md:flex absolute right-1 top-1/2 -translate-y-1/2 z-20 h-10 w-10 items-center justify-center rounded-2xl bg-white/55 backdrop-blur-lg border border-white/70 shadow-sm hover:bg-white/80 transition cursor-pointer"
                >
                  <ChevronRight className="w-5 h-5 text-[#2D332F]" strokeWidth={2.2} />
                </button>

                <div
                  ref={gameCarouselRef}
                  className="relative flex gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory pl-2 pr-6 pb-2"
                >
                  {gameLobby.map((g, i) => {
                    const isDaily = g.key === dailyGameKey;
                    return (
                      <motion.button
                        key={g.key}
                        type="button"
                        onClick={(e) => {
                          triggerXPFromEvent(g.rewardXp, e);
                          navigate(g.route);
                        }}
                        initial={{ opacity: 0, x: 60 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: i * 0.06 }}
                        whileHover={{ scale: 1.05, y: -6 }}
                        whileTap={{ scale: 0.97 }}
                        className={`group relative shrink-0 snap-start cursor-pointer ${
                          isDaily ? "w-[320px] sm:w-[420px] md:w-[460px]" : "w-[280px] sm:w-[340px] md:w-[380px]"
                        }`}
                      >
                        <motion.div
                          animate={
                            isDaily
                              ? { boxShadow: ["0 20px 60px -34px rgba(34,197,94,0.45)", "0 24px 75px -38px rgba(34,197,94,0.62)", "0 20px 60px -34px rgba(34,197,94,0.45)"] }
                              : undefined
                          }
                          transition={isDaily ? { duration: 2.6, repeat: Infinity, ease: "easeInOut" } : undefined}
                          className={`rounded-3xl p-5 bg-white/45 backdrop-blur-2xl border shadow-sm transition-all duration-300 ${
                            isDaily
                              ? "border-eco-primary/45 ring-1 ring-eco-primary/25 shadow-[0_20px_60px_-34px_rgba(34,197,94,0.55)] hover:shadow-[0_26px_80px_-44px_rgba(34,197,94,0.7)]"
                              : "border-white/80 bg-white/55 group-hover:shadow-[0_24px_80px_-40px_rgba(16,185,129,0.35)]"
                          }`}
                        >
                          {isDaily && (
                            <div className="flex items-center gap-2 mb-3">
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-eco-primary to-[#5E9F57] text-white text-[11px] font-bold shadow-md">
                                <Flame className="w-3 h-3" strokeWidth={2} />
                                Daily Challenge
                              </span>
                              <span className="inline-flex items-center px-2 py-1 rounded-full bg-white/60 border border-emerald-200/60 text-emerald-900 text-[11px] font-bold">
                              Ends in {formatCountdown(dailySecondsLeft)}
                              </span>
                              <span className="hidden sm:inline-flex items-center px-2 py-1 rounded-full bg-white/60 border border-emerald-200/60 text-emerald-900 text-[11px] font-bold">
                                +{g.rewardXp} XP
                              </span>
                            </div>
                          )}

                          {!isDaily && (
                            <div className="mb-3">
                              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/35 border border-white/70 text-gray-700 text-[11px] font-bold">
                                Play to earn XP
                              </span>
                            </div>
                          )}

                          <div className="flex items-center justify-between gap-4">
                            <div className="inline-flex items-center gap-3 min-w-0">
                              <span
                                className={`w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-100 to-eco-pale flex items-center justify-center border transition-all duration-300 ${
                                  isDaily ? "border-eco-primary/30 shadow-[0_0_0_4px_rgba(16,185,129,0.12)]" : "border-emerald-100/70"
                                }`}
                              >
                                <g.Icon className="w-6 h-6 text-eco-primary" strokeWidth={2.2} />
                              </span>
                              <span className="min-w-0">
                                <p className="font-display font-bold text-sm text-[#2D332F] truncate">{g.title}</p>
                                <p className="text-xs text-gray-600 font-body mt-1">{g.description}</p>
                              </span>
                            </div>
                          </div>

                          <div className="mt-4 flex items-center justify-between">
                            <span className="font-display font-bold text-[#2D332F]">
                              <span className="text-eco-primary">+{g.rewardXp}</span> XP
                            </span>
                            <span
                              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-2xl text-sm font-semibold transition-all duration-300 ${
                                isDaily
                                  ? "bg-gradient-to-r from-eco-primary to-[#5E9F57] text-white border-eco-primary/20 hover:brightness-105"
                                  : "bg-white/55 border border-emerald-100/70 text-[#2D332F] group-hover:bg-white/80"
                              }`}
                            >
                              <Play className="w-4 h-4 text-current" strokeWidth={2.2} />
                              Play Now
                            </span>
                          </div>
                        </motion.div>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </motion.section>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
            >
              {[
                {
                  Icon: Zap,
                  label: "Total Points",
                  to: points,
                  value: points.toLocaleString(),
                  format: (n) => n.toLocaleString(),
                  glow: "group-hover:shadow-[0_16px_36px_-20px_rgba(245,158,11,0.75)]",
                  iconColor: "text-amber-500",
                  helperText: "Lifetime XP earned",
                },
                {
                  Icon: Flame,
                  label: "Day Streak",
                  to: streak,
                  value: `${streak} days`,
                  format: (n) => `${n} days`,
                  glow: "group-hover:shadow-[0_16px_36px_-20px_rgba(244,63,94,0.75)]",
                  iconColor: "text-rose-500",
                  pulseIcon: streak > 0,
                  helperText: streak > 0 ? "Keep it going!" : "Start a daily habit",
                },
                {
                  Icon: Medal,
                  label: "Global Rank",
                  to: typeof rank === "number" ? rank : null,
                  value: typeof rank === "number" ? `#${rank}` : String(rank),
                  format: (n) => `#${n}`,
                  glow: "group-hover:shadow-[0_16px_36px_-20px_rgba(14,165,233,0.75)]",
                  iconColor: "text-sky-600",
                  helperText: typeof rank === "number" && rank <= 10 ? "Top in your class" : "Keep climbing",
                },
                {
                  Icon: CheckCircle2,
                  label: "Missions Done",
                  to: missionsDone,
                  value: String(missionsDone),
                  format: (n) => n.toLocaleString(),
                  glow: "group-hover:shadow-[0_16px_36px_-20px_rgba(16,185,129,0.75)]",
                  iconColor: "text-emerald-600",
                  helperText: "Impact tasks finished",
                },
              ].map((c) => (
                <motion.div
                  key={c.label}
                  whileHover={{ scale: 1.04, y: -4 }}
                  whileTap={{ scale: 0.97 }}
                  className={`group rounded-3xl p-5 bg-white/40 backdrop-blur-2xl border border-white/70 shadow-sm flex flex-col items-center text-center transition-all duration-300 ${c.glow}`}
                >
                  <motion.span
                    initial={{ scale: 0, opacity: 0 }}
                    animate={c.pulseIcon ? { scale: [1, 1.15, 1], boxShadow: ["0 0 0 rgba(244,63,94,0)", "0 0 20px rgba(244,63,94,0.6)", "0 0 0 rgba(244,63,94,0)"] } : { scale: 1, opacity: 1 }}
                    whileHover={{ scale: 1.12 }}
                    transition={c.pulseIcon ? { duration: 2, repeat: Infinity, ease: "easeInOut" } : { duration: 0.2, ease: "easeOut" }}
                    className={`w-12 h-12 rounded-2xl bg-white/65 border border-white/70 shadow-sm flex items-center justify-center mb-3 ${c.pulseIcon ? 'ring-1 ring-rose-200' : ''}`}
                  >
                    <c.Icon className={`w-6 h-6 ${c.iconColor}`} strokeWidth={2.2} />
                  </motion.span>
                  <p className="font-display font-bold text-2xl">
                    <span className={c.iconColor}>
                      {typeof c.to === "number" ? <CountUpNumber to={c.to} format={c.format} /> : c.value}
                    </span>
                  </p>
                  <p className="text-sm text-gray-800 font-bold uppercase tracking-wide mt-1">
                    {c.label}
                  </p>
                  {c.helperText && (
                    <p className="text-xs text-gray-500 font-medium mt-1 group-hover:text-gray-700 transition-colors">
                      {c.helperText}
                    </p>
                  )}
                </motion.div>
              ))}
            </motion.div>

            <motion.section
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 }}
              className="rounded-3xl bg-white/40 backdrop-blur-2xl border border-white/70 shadow-[0_20px_60px_-20px_rgba(16,185,129,0.18)] p-6 sm:p-8 mb-8"
            >
              <h2 className="font-display font-bold text-xl text-[#2D332F] mb-6 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-eco-primary" strokeWidth={2.2} />
                Your Eco-Impact
              </h2>
              <div className="divide-y divide-white/35 rounded-2xl border border-white/60 overflow-hidden bg-white/20">
                {(!impact.co2Reduced && !impact.waterSaved && !quizzesAced) ? (
                  <div className="px-4 py-8 text-center bg-white/30">
                    <p className="text-gray-700 font-medium font-body mb-6 flex items-center justify-center gap-2">
                      <Sprout className="w-4 h-4 text-green-500" strokeWidth={2} />
                      Start your first mission to make an impact
                    </p>
                    <div className="flex flex-col gap-4 max-w-sm mx-auto opacity-40 grayscale pointer-events-none">
                      <div className="h-2 rounded-full bg-emerald-200/50 w-full" />
                      <div className="h-2 rounded-full bg-sky-200/50 w-4/5 mx-auto" />
                      <div className="h-2 rounded-full bg-lime-200/50 w-3/4 mx-auto" />
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="px-4 py-4 bg-emerald-50/25 hover:bg-emerald-50/35 transition-colors">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-3 text-gray-700 font-medium">
                          <span className="w-10 h-10 rounded-xl bg-emerald-100/70 flex items-center justify-center">
                            <TreePine className="w-5 h-5 text-emerald-700" />
                          </span>
                          CO₂ Saved
                        </span>
                        <span className="font-display font-bold text-gray-800">
                          {(impact.co2Reduced || 0).toFixed(1)} kg
                        </span>
                      </div>
                      <div className="mt-3 h-1.5 rounded-full bg-emerald-100/60 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(100, Math.round(((impact.co2Reduced || 0) / 20) * 100))}%` }}
                          transition={{ duration: 0.9, ease: "easeOut" }}
                          className="h-full rounded-full bg-emerald-500/70"
                        />
                      </div>
                    </div>
                    <div className="px-4 py-4 bg-sky-50/25 hover:bg-sky-50/35 transition-colors">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-3 text-gray-700 font-medium">
                          <span className="w-10 h-10 rounded-xl bg-sky-100/70 flex items-center justify-center">
                            <Droplet className="w-5 h-5 text-sky-600" />
                          </span>
                          Water Saved
                        </span>
                        <span className="font-display font-bold text-sky-600">
                          {Math.round(impact.waterSaved || 0)} L
                        </span>
                      </div>
                      <div className="mt-3 h-1.5 rounded-full bg-sky-100/60 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(100, Math.round(((impact.waterSaved || 0) / 400) * 100))}%` }}
                          transition={{ duration: 0.9, ease: "easeOut" }}
                          className="h-full rounded-full bg-sky-500/70"
                        />
                      </div>
                    </div>
                    <div className="px-4 py-4 bg-lime-50/25 hover:bg-lime-50/35 transition-colors">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-3 text-gray-700 font-medium">
                          <span className="w-10 h-10 rounded-xl bg-emerald-100/70 flex items-center justify-center">
                            <BookOpen className="w-5 h-5 text-emerald-700" />
                          </span>
                          Quizzes Aced
                        </span>
                        <span className="font-display font-bold text-[#5E9F57]">{quizzesAced}</span>
                      </div>
                      <div className="mt-3 h-1.5 rounded-full bg-lime-100/60 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(100, Math.round((quizzesAced / 20) * 100))}%` }}
                          transition={{ duration: 0.9, ease: "easeOut" }}
                          className="h-full rounded-full bg-lime-500/70"
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>
            </motion.section>

            <motion.section
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.14 }}
              className="rounded-3xl bg-white/40 backdrop-blur-2xl border border-white/70 shadow-[0_20px_60px_-20px_rgba(16,185,129,0.18)] p-6 sm:p-8 mb-8"
            >
              <h2 className="font-display font-bold text-xl text-[#2D332F] mb-6 flex items-center gap-2">
                <Award className="w-6 h-6 text-purple-600" strokeWidth={2.2} />
                School Events
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {activeSchoolEvents.map((ev) => (
                  <div key={ev._id} className="rounded-2xl bg-gradient-to-br from-purple-50/70 to-fuchsia-50/70 border border-purple-200/60 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <p className="font-display font-bold text-lg text-purple-900 leading-tight pr-2">{ev.title}</p>
                        <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-purple-200/80 text-purple-800 shrink-0">{ev.type}</span>
                      </div>
                      <p className="text-purple-700/80 text-xs font-semibold uppercase tracking-wide mb-4">
                        Scope: {ev.scope || "school-wide"} • Starts Soon
                      </p>
                    </div>
                    <button className="w-full mt-auto py-2.5 rounded-xl bg-white/60 text-purple-800 font-bold text-sm hover:bg-purple-600 hover:text-white transition-colors border border-purple-200/60">
                      View Details
                    </button>
                  </div>
                ))}
                {activeSchoolEvents.length === 0 && (
                  <div className="col-span-full text-slate-500 font-medium text-center py-6 border border-dashed border-slate-300 rounded-2xl bg-white/40">
                    No active school events right now. Check back later!
                  </div>
                )}
              </div>
            </motion.section>

            <motion.section
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.14 }}
              className="rounded-3xl bg-white/40 backdrop-blur-2xl border border-white/70 shadow-[0_20px_60px_-20px_rgba(16,185,129,0.16)] p-6 sm:p-8 mb-8"
            >
              <h2 className="font-display font-bold text-xl text-[#2D332F] mb-6 flex items-center gap-2">
                <Award className="w-6 h-6 text-violet-600" strokeWidth={2.2} />
                My Badges
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {badgeDefs.map((badge) => {
                  const Icon = badge.Icon;
                  return (
                    <motion.div
                      key={badge.id}
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{
                        scale: badge.unlocked ? [1, 1.08, 1] : 1,
                        opacity: 1
                      }}
                      transition={{ duration: 0.4 }}
                      role="button"
                      tabIndex={0}
                      onClick={() => {
                        playClick();
                        setActiveBadge(badge);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          setActiveBadge(badge);
                        }
                      }}
                      className={`relative rounded-2xl p-5 border transition-all duration-300 ease-in-out cursor-pointer hover:scale-[1.02] ${
                        badge.unlocked
                          ? "bg-white border-green-200 shadow-md hover:shadow-lg ring-2 ring-green-300 shadow-[0_0_20px_rgba(34,197,94,0.4)]"
                          : "bg-gray-50 border-gray-200 opacity-40 grayscale"
                      }`}
                      title={badge.unlocked ? "Unlocked Badge" : "Locked Badge"}
                    >
                      <Icon
                        size={28}
                        strokeWidth={2}
                        className={badge.unlocked ? "text-green-600 mb-3" : "text-gray-400 mb-3"}
                      />
                      <h3
                        className={`font-semibold ${
                          badge.unlocked ? "text-gray-900" : "text-gray-400"
                        }`}
                      >
                        {badge.title}
                      </h3>
                      <p className={`text-sm mt-1 ${
                        badge.unlocked ? "text-gray-600" : "text-gray-400"
                      }`}>
                        {badge.description}
                      </p>
                      {badge.unlocked && (
                        <CheckCircle
                          size={18}
                          className="absolute top-3 right-3 text-green-500"
                        />
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </motion.section>

            <AnimatePresence>
              {activeBadge && (
                <motion.div
                  className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setActiveBadge(null)}
                  role="dialog"
                  aria-modal="true"
                >
                  <motion.div
                    className="w-full max-w-md rounded-3xl bg-white/75 backdrop-blur-2xl border border-white/80 shadow-[0_24px_90px_-40px_rgba(16,185,129,0.45)] p-6"
                    initial={{ opacity: 0, y: 20, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 16, scale: 0.98 }}
                    transition={{ duration: 0.25 }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <span className="w-12 h-12 rounded-2xl bg-white/60 border border-white/80 flex items-center justify-center shadow-sm">
                          <activeBadge.Icon className="w-6 h-6 text-eco-primary" strokeWidth={2.2} />
                        </span>
                        <div>
                          <h3 className="font-display font-bold text-lg text-[#2D332F]">{activeBadge.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">{activeBadge.description}</p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          playClick();
                          triggerSuccess();
                          setActiveBadge(null);
                        }}
                        className="h-10 w-10 rounded-2xl bg-white/60 border border-white/80 hover:bg-white/80 transition text-gray-700"
                        aria-label="Close badge details"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="mt-5">
                      {activeBadge.unlocked ? (
                        <>
                          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-50 border border-green-200 w-fit mb-2">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span className="text-sm font-bold text-green-700">Unlocked</span>
                          </div>
                          <p className="text-sm text-gray-700 mt-1">
                            You&apos;ve earned this badge. Keep playing to collect more.
                          </p>
                        </>
                      ) : (
                        <>
                           <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 w-fit mb-2">
                            <span className="text-sm font-bold text-slate-500">Locked</span>
                          </div>
                          <p className="text-sm text-gray-700">
                            Complete challenges and earn XP to unlock this badge.
                          </p>
                        </>
                      )}
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.section
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.16 }}
              className="rounded-3xl bg-white/40 backdrop-blur-2xl border border-white/70 shadow-[0_20px_60px_-20px_rgba(16,185,129,0.14)] p-6 sm:p-8 mb-8"
            >
              <h2 className="font-display font-bold text-xl text-[#2D332F] mb-6 flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-violet-500" strokeWidth={2.2} />
                Recent Activity
              </h2>
              {recentActivity.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-8"
                >
                  <motion.div
                    className="mx-auto w-14 h-14 rounded-2xl bg-emerald-50/70 border border-emerald-100/80 flex items-center justify-center"
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <Leaf className="w-7 h-7 text-eco-primary" strokeWidth={2.2} />
                  </motion.div>
                  <p className="text-gray-600 text-center mt-4 font-medium flex items-center justify-center gap-2">
                    <Sprout className="w-4 h-4 text-green-500" strokeWidth={2} />
                    Start completing missions to see your journey here
                  </p>
                </motion.div>
              ) : (
                <ul className="space-y-3">
                  {recentActivity.map((row) => (
                    <li
                      key={row.key}
                      className="flex items-center gap-4 p-4 rounded-2xl bg-white/35 backdrop-blur-2xl border border-white/60 hover:bg-white/55 transition-colors"
                    >
                      <span className="w-11 h-11 rounded-xl bg-white/60 border border-white/70 flex items-center justify-center shrink-0 shadow-sm">
                        <row.Icon className="w-5 h-5 text-gray-600" strokeWidth={2} />
                      </span>
                      <div className="flex-1 min-w-0 text-left">
                        <p className="font-semibold text-gray-800 text-sm sm:text-base leading-tight flex items-center gap-1.5 flex-wrap">
                          <Sprout className="w-4 h-4 text-green-500 shrink-0 transition-transform hover:scale-110" strokeWidth={2} />
                          You earned <span className="text-eco-primary font-bold">+{row.pts} XP</span> from <span className="text-gray-900">{row.title}</span>
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5 font-medium">{row.sub}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </motion.section>


          </>
        )}

        {user.role !== "student" && (
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl bg-white/40 backdrop-blur-2xl border border-white/70 shadow-[0_20px_60px_-20px_rgba(16,185,129,0.16)] p-6 sm:p-8 mb-8"
          >
            <h2 className="font-display font-bold text-xl text-[#2D332F] mb-6">Teacher Tools</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {(user.role === "student" ? studentQuickActions : teacherActions).map((a) => (
                <motion.button
                  key={a.label}
                  type="button"
                  onClick={() => navigate(a.path)}
                  whileHover={{ scale: 1.04, y: -4 }}
                  whileTap={{ scale: 0.97 }}
                  className="rounded-3xl p-6 bg-white/40 backdrop-blur-2xl border border-white/70 transition text-center"
                >
                  <span className="inline-flex w-14 h-14 rounded-2xl bg-white shadow-sm items-center justify-center mx-auto mb-2">
                    <a.Icon className="w-7 h-7 text-eco-primary" strokeWidth={2} />
                  </span>
                  <span className="font-display font-bold text-gray-800 block">{a.label}</span>
                </motion.button>
              ))}
            </div>
          </motion.section>
        )}

      </div>
    </div>
  );
}

export default Dashboard;
