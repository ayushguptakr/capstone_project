import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { getStoredUser, isAuthenticated } from "../utils/authStorage";
import useSound from "../hooks/useSound";
import { apiRequest } from "../api/httpClient";
import {
  LayoutDashboard,
  BookOpen,
  Trophy,
  Rocket,
  Users,
  Gamepad2,
  Globe2,
  Sparkles,
  Map,
  ShoppingBag,
  Zap
} from "lucide-react";
import * as AllIcons from "lucide-react";
import { EcoLogo } from "./EcoLogo";
import NotificationBell from "./NotificationBell";
import MobileBottomNav from "./MobileBottomNav";

/** Logged-in: center nav (Quiz, Games, Leaderboard). */
const appNavItems = (dashPath, showGames, activeMissionsCount = 0) => [
  {
    to: dashPath,
    label: "Dashboard",
    icon: LayoutDashboard,
    match: (p) => p === dashPath || p.startsWith(`${dashPath}/`),
  },
  {
    to: "/quizzes",
    label: "Quiz",
    icon: BookOpen,
    match: (p) => p.startsWith("/quiz") || p.startsWith("/quizzes"),
  },
  ...(showGames
    ? [
        {
          to: "/mini-games",
          label: "Games",
          icon: Gamepad2,
          match: (p) => p.startsWith("/mini-games") || p.startsWith("/mini-game"),
        },
        {
          to: "/missions",
          label: "Missions",
          icon: Map,
          match: (p) => p.startsWith("/missions") || p.startsWith("/submit"),
          badge: activeMissionsCount > 0 ? activeMissionsCount : 0,
        },
        {
          to: "/store",
          label: "Store",
          icon: ShoppingBag,
          match: (p) => p.startsWith("/store") || p.startsWith("/marketplace"),
        },
      ]
    : []),
  { to: "/leaderboard", label: "Leaderboard", icon: Trophy, match: (p) => p.startsWith("/leaderboard") },
];

function initials(name) {
  if (!name || typeof name !== "string") return "?";
  const p = name.trim().split(/\s+/);
  if (p.length >= 2) return (p[0][0] + p[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

/**
 * @param {"landing" | "app"} variant — landing: public nav OR app nav if logged in; app: always app nav (Dashboard pages)
 * @param {number} [xp] — points for XP badge when logged in
 */
export default function EcoQuestNav({ variant = "landing", xp = 0 }) {
  const { pathname } = useLocation();
  const user = getStoredUser();
  const loggedIn = isAuthenticated() && user;
  const navigate = useNavigate();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);
  const { muted, toggleMute, playClick } = useSound();
  const [activeMissionsCount, setActiveMissionsCount] = useState(0);

  const dashPath = user?.role === "teacher" ? "/teacher-dashboard" : "/dashboard";
  const xpDisplay = typeof xp === "number" ? xp.toLocaleString() : "0";

  const handleLogoClick = (e) => {
    e.preventDefault();
    playClick();
    if (!loggedIn) {
      navigate("/");
    } else if (pathname !== dashPath) {
      navigate(dashPath);
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };
  const userSkins = user?.equippedSkins || {};

  const showGames = user?.role === "student";
  const appLinks = useMemo(() => appNavItems(dashPath, showGames, activeMissionsCount), [dashPath, showGames, activeMissionsCount]);

  const showAppBar = variant === "app" || (variant === "landing" && loggedIn);

  useEffect(() => {
    if (showGames && loggedIn) {
      Promise.all([
        apiRequest("/api/tasks").catch(() => []),
        apiRequest("/api/submissions/my").catch(() => [])
      ]).then(([tasksResp, subResp]) => {
        const tList = Array.isArray(tasksResp) ? tasksResp : tasksResp?.tasks || [];
        const sList = Array.isArray(subResp) ? subResp : subResp?.submissions || [];
        const active = tList.filter(t => {
          const sub = sList.find(s => s.task?._id === t._id || s.task === t._id);
          return !sub || sub.status === "rejected";
        });
        setActiveMissionsCount(active.length);
      });
    }
  }, [showGames, loggedIn]);

  useEffect(() => {
    if (!profileMenuOpen) return;
    const onDocClick = (e) => {
      const node = profileMenuRef.current;
      if (!node) return;
      if (node.contains(e.target)) return;
      setProfileMenuOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [profileMenuOpen]);

  if (showAppBar) {
    return (
      <>
        <motion.header
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm"
        >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between w-full">
          <motion.button 
            onClick={handleLogoClick} 
            whileHover={{ scale: 1.05 }}
            className="flex items-center shrink-0 cursor-pointer outline-none"
          >
            <EcoLogo className="w-10 h-10" withText={true} animated={true} currentXp={xp} equippedSkins={userSkins} />
          </motion.button>

          <nav className="hidden md:flex flex-1 justify-center min-w-0 order-3 md:order-none w-full md:w-auto">
            <ul className="flex items-center gap-1 md:gap-2 overflow-x-auto pb-1 md:pb-0 no-scrollbar max-w-full">
              {appLinks.map(({ to, label, icon: Icon, match, badge }) => {
                const active = match(pathname);
                return (
                  <li key={to + label}>
                    <Link
                      to={to}
                      onClick={playClick}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl text-sm font-semibold whitespace-nowrap transition-all duration-200 hover:scale-[1.04] ${
                        active
                          ? "bg-[#E8F2E7] text-[#2D332F] ring-1 ring-[#5E9F57]/20 shadow-sm"
                          : "text-gray-600 hover:bg-gray-50 hover:text-[#2D332F]"
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0 opacity-85" strokeWidth={2} />
                      <span className="relative">
                        {label}
                        {badge > 0 && (
                          <span className="absolute -top-1.5 -right-3.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white shadow-sm ring-1 ring-white">
                            {badge}
                          </span>
                        )}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {showGames && <NotificationBell />}
            <motion.div 
              key={xpDisplay}
              initial={{ scale: 1.2, backgroundColor: "#dcfce7" }}
              animate={{ scale: 1, backgroundColor: "#fffbeb" }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
              className="flex items-center gap-2 px-3 py-2 rounded-2xl border border-amber-100/90 text-amber-900 text-sm font-bold shadow-sm"
            >
              <span aria-hidden className="text-base leading-none">
                <Zap className="w-2 h-2 text-amber-500" strokeWidth={3} />
              </span>
              <span>{xpDisplay} XP</span>
            </motion.div>

            <div className="relative">
              <button
                type="button"
                onClick={() => setProfileMenuOpen((v) => !v)}
                className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-eco-pale to-emerald-100 text-[#2D332F] font-display font-bold text-sm border shadow-sm hover:shadow-md hover:scale-105 transition-all cursor-pointer"
                aria-haspopup="menu"
                aria-expanded={profileMenuOpen}
                title="Profile"
              >
                {(() => {
                  const AvatarIcon = user?.equippedAvatar && user.equippedAvatar !== "User" ? AllIcons[user.equippedAvatar] || AllIcons.User : null;
                  return AvatarIcon ? <AvatarIcon className="w-[60%] h-[60%] text-[#15803d]" strokeWidth={2.5} /> : initials(user?.name);
                })()}
              </button>

              {profileMenuOpen && (
                <div
                  ref={profileMenuRef}
                  role="menu"
                  className="absolute right-0 mt-2 w-44 rounded-2xl bg-white/85 backdrop-blur-xl border border-white/70 shadow-[0_20px_60px_-20px_rgba(16,185,129,0.22)] overflow-hidden z-50"
                >
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      playClick();
                      toggleMute();
                    }}
                    className="w-full text-left block px-4 py-3 text-sm font-semibold text-[#2D332F] hover:bg-emerald-50/70 transition-colors"
                  >
                    Sound: {muted ? "Off" : "On"}
                  </button>
                  <Link
                    to="/profile"
                    role="menuitem"
                    onClick={() => {
                      playClick();
                      setProfileMenuOpen(false);
                    }}
                    className="block px-4 py-3 text-sm font-semibold text-[#2D332F] hover:bg-emerald-50/70 transition-colors"
                  >
                    Profile
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      playClick();
                      localStorage.clear();
                      setProfileMenuOpen(false);
                      navigate("/", { replace: true });
                    }}
                    role="menuitem"
                    className="w-full text-left block px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50/70 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        </motion.header>

        {/* Mobile App Navigation */}
        <MobileBottomNav links={appLinks} playClick={playClick} />
      </>
    );
  }

  /* Logged-out landing navbar */
  const scrollLink = (id, label, Icon) => (
    <li key={id}>
      <a
        href={`#${id}`}
        className="flex items-center gap-1.5 px-3 py-2 rounded-2xl text-sm font-semibold text-gray-600 hover:bg-[#E8F2E7]/60 hover:text-[#2D332F] transition-colors"
      >
        {Icon && <Icon className="w-4 h-4 shrink-0 opacity-80" strokeWidth={2} />}
        {label}
      </a>
    </li>
  );

  return (
    <motion.header
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
        <motion.button 
          onClick={handleLogoClick} 
          whileHover={{ scale: 1.05 }}
          className="flex items-center shrink-0 cursor-pointer outline-none"
        >
          <EcoLogo className="w-10 h-10" withText={true} animated={true} currentXp={xp} equippedSkins={userSkins} />
        </motion.button>

        <nav className="flex flex-1 justify-center min-w-0 order-3 sm:order-none w-full sm:w-auto">
          <ul className="flex items-center gap-0.5 sm:gap-1 overflow-x-auto pb-1 sm:pb-0 no-scrollbar max-w-full">
            <li>
              <a
                href="#top"
                className="flex items-center gap-1.5 px-3 py-2 rounded-2xl text-sm font-semibold text-gray-600 hover:bg-[#E8F2E7]/60 hover:text-[#2D332F] transition-colors"
              >
                <Sparkles className="w-4 h-4 shrink-0 opacity-80" strokeWidth={2} />
                Home
              </a>
            </li>
            {scrollLink("features", "Features", Users)}
            {scrollLink("how-it-works", "How It Works", Globe2)}
            {scrollLink("missions", "Missions", Map)}
          </ul>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <Link
            to="/login"
            onClick={playClick}
            className="inline-flex items-center justify-center px-4 py-2.5 rounded-2xl border-2 border-[#5E9F57]/35 text-[#2D332F] text-sm font-bold hover:bg-[#E8F2E7]/80 transition-colors"
          >
            Login
          </Link>
          <Link
            to="/signup"
            onClick={playClick}
            className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#5E9F57] to-eco-primary text-white text-sm font-bold shadow-md hover:shadow-lg hover:brightness-105 transition-all active:scale-[0.98]"
          >
            <Rocket className="w-4 h-4" strokeWidth={2.5} />
            Sign Up
          </Link>
        </div>
      </div>
    </motion.header>
  );
}
