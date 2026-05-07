import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  CalendarPlus,
  Bell,
  BookOpen,
  ClipboardCheck,
  LayoutDashboard,
  Megaphone,
  Menu,
  Search,
  Settings,
  Users,
  UserCircle2,
  X,
  LogOut,
  School,
  BarChart3,
} from "lucide-react";
import { EcoLogo } from "./EcoLogo";
import { useAuth } from "../context/AuthContext";

const NAV_ITEMS = [
  { label: "Dashboard", to: "/teacher-dashboard", Icon: LayoutDashboard },
  { label: "Classes", to: "/teacher/classes", Icon: School },
  { label: "Students", to: "/teacher/students", Icon: Users },
  { label: "Quizzes", to: "/teacher/quizzes", Icon: BookOpen },
  { label: "Tasks", to: "/teacher/tasks", Icon: ClipboardCheck },
  { label: "Submissions", to: "/teacher/submissions", Icon: ClipboardCheck },
  { label: "Analytics", to: "/teacher/analytics", Icon: BarChart3 },
  { label: "Announcements", to: "/teacher/announcements", Icon: Megaphone },
  { label: "Settings", to: "/teacher/settings", Icon: Settings },
];

const BREADCRUMB_LABELS = {
  "/teacher-dashboard": "Dashboard",
  "/teacher/classes": "Classes",
  "/teacher/students": "Students",
  "/teacher/students/profile": "Student Profile",
  "/teacher/quizzes": "Quizzes",
  "/teacher/tasks": "Tasks",
  "/teacher/content": "Content",
  "/teacher/submissions": "Submissions",
  "/teacher/analytics": "Analytics",
  "/teacher/announcements": "Announcements",
  "/teacher/settings": "Settings",
  "/teacher/scheduling": "Scheduling",
};

function getUserName() {
  try {
    return JSON.parse(localStorage.getItem("user") || "{}")?.name || "Teacher";
  } catch {
    return "Teacher";
  }
}

export default function TeacherShell({
  title,
  subtitle,
  searchPlaceholder = "Search students, quizzes, tasks...",
  onSearch,
  children,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [showProfile, setShowProfile] = useState(false);
  const [themeMode, setThemeMode] = useState("premium");
  const userName = useMemo(() => user?.name || getUserName(), [user]);
  const breadcrumb = location.pathname.startsWith("/teacher/students/")
    ? "Student Profile"
    : (BREADCRUMB_LABELS[location.pathname] || "Teacher Workspace");

  const quickActions = useMemo(
    () => [
      { label: "New Quiz", to: "/teacher/quizzes", Icon: BookOpen },
      { label: "New Task", to: "/teacher/tasks", Icon: ClipboardCheck },
      { label: "Schedule", to: "/teacher/scheduling", Icon: CalendarPlus },
      { label: "Announce", to: "/teacher/announcements", Icon: Megaphone },
    ],
    []
  );

  useEffect(() => {
    if (typeof onSearch === "function") onSearch(query);
  }, [onSearch, query]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("eco_teacher_theme");
      if (stored === "classic" || stored === "premium") {
        setThemeMode(stored);
      }
    } catch {
      // keep default premium mode
    }
    const syncTheme = () => {
      try {
        const next = localStorage.getItem("eco_teacher_theme");
        if (next === "classic" || next === "premium") {
          setThemeMode(next);
        }
      } catch {
        // ignore read issues
      }
    };
    window.addEventListener("eco-teacher-theme-change", syncTheme);
    return () => window.removeEventListener("eco-teacher-theme-change", syncTheme);
  }, []);

  const isPremium = themeMode === "premium";

  return (
    <div className={isPremium ? "min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-cyan-50/40 text-slate-900" : "min-h-screen bg-slate-50 text-slate-900"}>
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 transition-transform lg:translate-x-0 ${
          isPremium
            ? "border-r border-slate-800/50 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-900 text-slate-100 shadow-[0_20px_60px_-20px_rgba(2,6,23,0.7)]"
            : "border-r border-slate-200 bg-white text-slate-800 shadow-sm"
        } ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className={`h-16 px-4 flex items-center justify-between ${isPremium ? "border-b border-white/10" : "border-b border-slate-200"}`}>
          <div className="flex items-center gap-1">
            <EcoLogo size="sm" withText={true} showTagline={false} animated={false} />
            <span className={`font-display font-semibold text-sm ml-0.5 ${isPremium ? "text-emerald-200" : "text-emerald-700"}`}>Teacher</span>
          </div>
          <button className={`lg:hidden p-2 rounded-xl ${isPremium ? "hover:bg-white/10" : "hover:bg-slate-100"}`} onClick={() => setOpen(false)}>
            <X className="w-4 h-4" />
          </button>
        </div>
        <nav className="p-3 space-y-1.5">
          {NAV_ITEMS.map((item) => {
            const active =
              location.pathname === item.to ||
              (item.to !== "/teacher-dashboard" && location.pathname.startsWith(item.to));
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`w-full rounded-xl px-3 py-2.5 flex items-center gap-2 text-sm font-semibold transition ${
                  active
                    ? (isPremium
                      ? "bg-gradient-to-r from-emerald-500/20 to-cyan-500/10 text-emerald-200 border border-emerald-400/30"
                      : "bg-emerald-50 text-emerald-700 border border-emerald-200")
                    : (isPremium ? "text-slate-300 hover:bg-white/5 hover:text-white" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900")
                }`}
                onClick={() => setOpen(false)}
              >
                <item.Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
          <Link
            to="/teacher/scheduling"
            className={`w-full rounded-xl px-3 py-2.5 flex items-center gap-2 text-sm font-semibold transition ${
              location.pathname.startsWith("/teacher/scheduling")
                ? (isPremium
                  ? "bg-gradient-to-r from-indigo-500/20 to-violet-500/10 text-indigo-200 border border-indigo-400/30"
                  : "bg-indigo-50 text-indigo-700 border border-indigo-200")
                : (isPremium ? "text-slate-300 hover:bg-white/5 hover:text-white" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900")
            }`}
            onClick={() => setOpen(false)}
          >
            <ClipboardCheck className="w-4 h-4" />
            Scheduling
          </Link>
        </nav>
      </aside>

      <div className="lg:pl-72">
        <header className={`h-16 sticky top-0 z-30 px-4 sm:px-6 flex items-center gap-3 ${isPremium ? "border-b border-white/60 bg-white/80 backdrop-blur-xl" : "border-b border-slate-200 bg-white"}`}>
          <button className="p-2 rounded-xl hover:bg-slate-100 lg:hidden" onClick={() => setOpen(true)}>
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1 max-w-xl relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2 text-sm outline-none focus:border-emerald-300"
            />
          </div>
          <button className="w-10 h-10 rounded-xl border border-slate-200/80 bg-white flex items-center justify-center hover:bg-slate-100">
            <Bell className="w-4 h-4 text-slate-600" />
          </button>
          <div className="hidden xl:flex items-center gap-2">
            {quickActions.map((action) => (
              <button
                key={action.label}
                onClick={() => navigate(action.to)}
                className="h-10 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-sm font-semibold text-slate-700 inline-flex items-center gap-1.5"
              >
                <action.Icon className="w-4 h-4" />
                {action.label}
              </button>
            ))}
          </div>
          <div className="relative">
            <button
              className="px-3 h-10 rounded-xl border border-slate-200 flex items-center gap-2 hover:bg-slate-100"
              onClick={() => setShowProfile((v) => !v)}
            >
              <UserCircle2 className="w-4 h-4 text-slate-600" />
              <span className="text-sm font-semibold hidden sm:inline">{userName}</span>
            </button>
            {showProfile ? (
              <div className="absolute right-0 mt-2 w-44 rounded-xl border border-slate-200 bg-white shadow-lg p-1">
                <button
                  className="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-slate-100 flex items-center gap-2"
                  onClick={() => {
                    logout();
                    navigate("/", { replace: true });
                  }}
                >
                  <LogOut className="w-4 h-4 text-red-500" />
                  Logout
                </button>
              </div>
            ) : null}
          </div>
        </header>

        <main className="p-4 sm:p-6 space-y-4">
          <div className="text-xs text-slate-500 font-semibold tracking-wide uppercase">
            Teacher Workspace / {breadcrumb}
          </div>
          <div>
            <h1 className="font-display font-bold text-2xl text-slate-900">{title}</h1>
            {subtitle ? <p className="text-slate-600 mt-1">{subtitle}</p> : null}
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
