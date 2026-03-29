import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  Brain,
  Gamepad2,
  ShoppingBag,
  Trophy,
  Upload,
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
  TreePine,
  Crown,
  Sparkles,
  Award,
  Shield,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { EcoQuestNav, EcoLoader } from "../components";
import useFeedback from "../hooks/useFeedback";
import useSound from "../hooks/useSound";
import { getStoredUser } from "../utils/authStorage";
import { fetchGamificationMe } from "../api/gamificationApi";
import { apiRequest } from "../api/httpClient";

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

function nextLevelMeta(points) {
  const nextLevelXp = Math.max(1000, (Math.floor(points / 1000) + 1) * 1000);
  const xpToNext = Math.max(0, nextLevelXp - points);
  const pct = nextLevelXp > 0 ? Math.min(100, (points / nextLevelXp) * 100) : 0;
  return { nextLevelXp, xpToNext, pct };
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
  const { triggerXP, triggerXPFromEvent, triggerBadgeUnlock, triggerLevelUp, triggerSuccess } =
    useFeedback();
  const { playClick } = useSound();
  const [user, setUser] = useState(() => getStoredUser());
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
  const [typedGreeting, setTypedGreeting] = useState("");
  const [levelFlash, setLevelFlash] = useState(false);
  const prevLevelRef = useRef(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      navigate("/login", { replace: true });
      return;
    }
    try {
      setUser(JSON.parse(storedUser));
    } catch {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    setStreak(parseInt(localStorage.getItem("ecoStreak") || "0", 10));
  }, []);

  useEffect(() => {
    const onStreakUpdate = (event) => {
      const next = Number(event?.detail?.streak || 0);
      setStreak(next);
    };
    window.addEventListener("ecoquest:streak-updated", onStreakUpdate);
    return () => window.removeEventListener("ecoquest:streak-updated", onStreakUpdate);
  }, []);

  useEffect(() => {
    if (!user) return;
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
          const [progressData, attemptsData, submissionsData] = await Promise.all([
            apiRequest("/api/leaderboard/progress"),
            apiRequest("/api/quizzes/attempts/my"),
            apiRequest("/api/submissions/my"),
          ]);
          setProgress(progressData);
          setAttempts(attemptsData);
          setMySubs(submissionsData);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchData();
  }, [user]);

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

  const points =
    progress?.student?.points ??
    gamificationSummary?.points ??
    meProfile?.points ??
    user?.points ??
    0;
  const level = getLevel(points);
  const impact = ecoReport?.impactSummary || {};
  const rank = progress?.student?.rank ?? "—";
  const missionsDone = progress?.taskStats?.approvedSubmissions ?? 0;
  const quizzesAced = useMemo(
    () => attempts.filter((a) => a.percentage === 100).length,
    [attempts]
  );
  const levelNum =
    progress?.student?.level != null && progress.student.level > 0
      ? progress.student.level
      : meProfile?.level != null && meProfile.level > 0
        ? meProfile.level
        : Math.max(1, Math.floor(points / 100) + 1);
  const { xpToNext, pct } = nextLevelMeta(points);

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
    const titles = (progress?.student?.badges || user?.badges || []).map((b) => b.title);
    const has = (t) => titles.some((x) => x === t || x?.includes?.(t));
    return [
      {
        title: "Quiz Champ",
        sub: "Quiz Master",
        earned: has("Quiz Master"),
        bg: "bg-sky-100",
        iconBg: "bg-sky-200/80",
        text: "text-sky-900",
        Icon: BookOpen,
      },
      {
        title: "Eco Scholar",
        sub: "500+ XP",
        earned: has("Eco Scholar"),
        bg: "bg-violet-100",
        iconBg: "bg-violet-200/80",
        text: "text-violet-900",
        Icon: Award,
      },
      {
        title: "On Fire!",
        sub: "7-day streak",
        earned: streak >= 7,
        bg: "bg-orange-100",
        iconBg: "bg-orange-200/80",
        text: "text-orange-900",
        Icon: Flame,
      },
      {
        title: "Tree Hugger",
        sub: "5+ missions",
        earned: missionsDone >= 5,
        bg: "bg-emerald-100",
        iconBg: "bg-emerald-200/80",
        text: "text-emerald-900",
        Icon: TreePine,
        locked: true,
      },
      {
        title: "Water Hero",
        sub: "Save 100L",
        earned: (impact.waterSaved || 0) >= 100,
        bg: "bg-sky-100",
        iconBg: "bg-sky-200/80",
        text: "text-sky-900",
        Icon: Droplet,
        locked: true,
      },
      {
        title: "Top Star",
        sub: "Top 3 rank",
        earned: typeof rank === "number" && rank <= 3,
        bg: "bg-amber-100",
        iconBg: "bg-amber-200/80",
        text: "text-amber-900",
        Icon: Crown,
        locked: true,
      },
    ];
  }, [progress, user, streak, missionsDone, impact.waterSaved, rank]);

  const gameCarouselRef = useRef(null);
  const scrollGameCarousel = (dir) => {
    const el = gameCarouselRef.current;
    if (!el) return;
    el.scrollBy({
      left: dir * Math.max(320, Math.floor(el.clientWidth * 0.85)),
      behavior: "smooth",
    });
  };

  if (!user) {
    return <EcoLoader />;
  }

  const firstName = user.name?.split(" ")[0] || "Eco Hero";

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
    { Icon: Upload, label: "Submissions", path: "/mysubmissions", color: "blue" },
  ];

  const teacherActions = [
    { Icon: Plus, label: "Create Task", path: "/create-task", color: "green" },
    { Icon: Brain, label: "Create Quiz", path: "/create-quiz", color: "blue" },
    { Icon: BarChart3, label: "Analytics", path: "/teacher-dashboard", color: "green" },
    { Icon: Globe, label: "Sustainability", path: "/sustainability-dashboard", color: "blue" },
    { Icon: BookOpen, label: "My Tasks", path: "/mytasks", color: "green" },
    { Icon: Eye, label: "Submissions", path: "/submissions", color: "blue" },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#E8F5E9] via-[#F9FAF7] to-[#FFFDE7] pb-24">
      <div className="absolute inset-0 pointer-events-none z-0" aria-hidden>
        <div className="absolute -top-28 -left-28 w-96 h-96 rounded-full bg-emerald-300/25 blur-3xl" />
        <div className="absolute top-10 right-[-5rem] w-96 h-96 rounded-full bg-teal-200/18 blur-3xl" />
        <div className="absolute bottom-[-7rem] left-[-3rem] w-[30rem] h-[30rem] rounded-full bg-lime-200/15 blur-[95px]" />
      </div>

      <EcoQuestNav variant="app" xp={points} />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.62, ease: [0.22, 1, 0.36, 1] }}
          className="mb-10"
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
            >
              👋
            </motion.span>
          </h1>
          <p className="text-gray-600 mt-2 text-lg font-body">
            You&apos;re making a real impact today <span aria-hidden>🌱</span>
          </p>
          <p className="mt-1 text-eco-primary font-bold font-body">
            {xpToNext.toLocaleString()} XP to reach Level {levelNum + 1}
          </p>
        </motion.div>

        {user.role === "student" && (
          <>
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
                      <span className="text-amber-500 inline-flex" aria-hidden>
                        ★
                      </span>
                    </p>
                  </div>
                </div>
                <div className="text-right sm:text-right">
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
                  <h2 className="font-display font-bold text-2xl sm:text-3xl text-[#2D332F] tracking-tight">
                    Play & Learn <span aria-hidden>🌍</span>
                  </h2>
                  <p className="mt-2 text-gray-600 font-body text-sm sm:text-base">
                    Earn XP while playing eco mini-games
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
                                🔥 Daily Challenge
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
                },
                {
                  Icon: Flame,
                  label: "Day Streak",
                  to: streak,
                  value: `${streak} days`,
                  format: (n) => `${n} days`,
                  glow: "group-hover:shadow-[0_16px_36px_-20px_rgba(244,63,94,0.75)]",
                  iconColor: "text-rose-500",
                },
                {
                  Icon: Medal,
                  label: "Global Rank",
                  to: typeof rank === "number" ? rank : null,
                  value: typeof rank === "number" ? `#${rank}` : String(rank),
                  format: (n) => `#${n}`,
                  glow: "group-hover:shadow-[0_16px_36px_-20px_rgba(14,165,233,0.75)]",
                  iconColor: "text-sky-600",
                },
                {
                  Icon: CheckCircle2,
                  label: "Missions Done",
                  to: missionsDone,
                  value: String(missionsDone),
                  format: (n) => n.toLocaleString(),
                  glow: "group-hover:shadow-[0_16px_36px_-20px_rgba(16,185,129,0.75)]",
                  iconColor: "text-emerald-600",
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
                    animate={{ scale: 1, opacity: 1 }}
                    whileHover={{ scale: 1.12 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="w-12 h-12 rounded-2xl bg-white/65 border border-white/70 shadow-sm flex items-center justify-center mb-3"
                  >
                    <c.Icon className={`w-6 h-6 ${c.iconColor}`} strokeWidth={2.2} />
                  </motion.span>
                  <p className="font-display font-bold text-2xl">
                    <span className={c.iconColor}>
                      {typeof c.to === "number" ? <CountUpNumber to={c.to} format={c.format} /> : c.value}
                    </span>
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600 font-semibold uppercase tracking-wide mt-1">
                    {c.label}
                  </p>
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
                {badgeDefs.map((b, i) => {
                  const earned = b.earned;
                  const muted = b.locked && !earned;
                  const rarity =
                    i % 3 === 0
                      ? "ring-amber-200/70"
                      : i % 3 === 1
                        ? "ring-slate-200/80"
                        : "ring-emerald-200/70";
                  return (
                    <motion.div
                      key={b.title}
                      whileHover={earned && !muted ? { scale: 1.08, y: -4 } : { scale: 1.02, y: -1 }}
                      role="button"
                      tabIndex={0}
                      onClick={() =>
                        {
                          playClick();
                          if (earned && !muted) triggerBadgeUnlock(b);
                          setActiveBadge({
                            title: b.title,
                            sub: b.sub,
                            earned,
                            locked: muted,
                            Icon: b.Icon,
                          });
                        }
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          setActiveBadge({
                            title: b.title,
                            sub: b.sub,
                            earned,
                            locked: muted,
                            Icon: b.Icon,
                          });
                        }
                      }}
                      className={`cursor-pointer rounded-3xl p-5 text-center border backdrop-blur-2xl transition-all duration-300 ${
                        earned && !muted
                          ? `bg-white/60 border-white/70 shadow-[0_20px_50px_-22px_rgba(16,185,129,0.62)] ring-1 ${rarity}`
                          : "bg-white/20 border-white/50 opacity-65 grayscale blur-[0.4px]"
                      } ${earned && !muted ? "hover:shadow-[0_24px_56px_-24px_rgba(16,185,129,0.75)]" : ""}`}
                    >
                      <div
                        className={`w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center ${
                          earned && !muted ? b.iconBg : "bg-white/15 border border-white/40"
                        }`}
                      >
                        <b.Icon
                          className={`w-6 h-6 ${earned && !muted ? b.text : "text-gray-400"}`}
                          strokeWidth={2}
                        />
                      </div>
                      <p
                        className={`font-display font-bold text-sm ${
                          earned && !muted ? b.text : "text-gray-400"
                        }`}
                      >
                        {b.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{b.sub}</p>
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
                          <p className="text-sm text-gray-600 mt-1">{activeBadge.sub}</p>
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
                      {activeBadge.locked ? (
                        <>
                          <p className="text-sm font-semibold text-red-600">Locked</p>
                          <p className="text-sm text-gray-700 mt-1">
                            Unlock at <span className="font-bold text-eco-primary">500 XP</span>
                          </p>

                          <div className="mt-4 h-2 rounded-full bg-gray-200/60 overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.min(100, Math.round((points / 500) * 100))}%` }}
                              transition={{ duration: 0.8, ease: "easeOut" }}
                              className="h-full rounded-full bg-gradient-to-r from-eco-primary to-[#5E9F57]"
                            />
                          </div>

                          <p className="mt-2 text-xs text-gray-600">
                            {points.toLocaleString()} / 500 XP
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="text-sm font-semibold text-eco-primary">Unlocked!</p>
                          <p className="text-sm text-gray-700 mt-1">
                            You&apos;ve earned this badge. Keep playing to collect more.
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
                  <p className="text-gray-600 text-center mt-4 font-medium">
                    Start completing missions to see your journey here <span aria-hidden>🌱</span>
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
                        <p className="font-semibold text-gray-800 truncate">{row.title}</p>
                        <p className="text-sm text-gray-500">{row.sub}</p>
                      </div>
                      <span
                        className={`font-display font-bold shrink-0 ${
                          row.pts >= 0 ? "text-eco-primary" : "text-red-500"
                        }`}
                      >
                        +{row.pts}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </motion.section>

            {(recommendations.length > 0 || weakCategory) && (
              <motion.section
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mb-8 rounded-3xl bg-white/35 backdrop-blur-2xl border border-white/70 shadow-[0_20px_60px_-20px_rgba(16,185,129,0.14)] p-6"
              >
                <h2 className="font-display font-bold text-lg text-gray-800 mb-2 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-eco-primary" />
                  Today&apos;s Missions
                </h2>
                {weakCategory && (
                  <p className="text-sm text-amber-800 mb-3">
                    Level up in: <strong>{weakCategory}</strong>
                  </p>
                )}
                <div className="space-y-2">
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
                        whileHover={{ scale: 1.03, y: -2 }}
                        whileTap={{ scale: 0.97 }}
                        className="group w-full text-left rounded-2xl bg-white/40 backdrop-blur-2xl border border-white/70 px-4 py-3 flex flex-col gap-2 transition-all duration-300 hover:border-emerald-200/85 hover:shadow-[0_20px_45px_-26px_rgba(16,185,129,0.55)]"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <span className="inline-flex items-center gap-3 min-w-0">
                            <span className="w-10 h-10 rounded-2xl bg-emerald-50/60 border border-emerald-100 flex items-center justify-center">
                              <MI className="w-5 h-5 text-eco-primary" strokeWidth={2.2} />
                            </span>
                            <span className="font-semibold text-[#2D332F] truncate">{t.title}</span>
                          </span>
                          <span className="text-eco-primary font-bold shrink-0">
                            +{t.points} XP
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold border ${
                              difficulty === "Easy"
                                ? "bg-emerald-50/60 border-emerald-200/70 text-emerald-800"
                                : difficulty === "Medium"
                                  ? "bg-amber-50/70 border-amber-200/80 text-amber-900"
                                  : "bg-red-50/70 border-red-200/80 text-red-800"
                            }`}
                          >
                            {difficulty}
                          </span>

                          <span className="text-sm text-gray-600 inline-flex items-center gap-2 font-semibold group-hover:text-eco-primary">
                            Open quest
                            <ArrowRight className="w-4 h-4 text-eco-primary transition-transform duration-300 group-hover:translate-x-1" strokeWidth={2.2} />
                          </span>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </motion.section>
            )}
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
