import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Users, 
  TrendingUp, 
  Award, 
  CalendarPlus, 
  AlertCircle, 
  CheckCircle,
  Lightbulb,
  LogOut,
  Mail,
  UserPlus,
  Copy,
  Eye,
  EyeOff,
  X
} from "lucide-react";
import { apiRequest, isFeatureDisabledError } from "../api/httpClient";
import { useAlert } from "../components/ui/AlertProvider";
import { EcoLogo } from "../components/EcoLogo";
import { useAuth } from "../context/AuthContext";

export default function PrincipalDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const navigate = useNavigate();
  const { showAlert } = useAlert();
  const { user, isLoggedIn, logout } = useAuth();

  const [overview, setOverview] = useState({
    totalStudents: 0,
    activeStudentsToday: 0,
    totalTeachers: 0,
    weeklyXp: 0,
    tasksCompleted: 0
  });
  
  const [teachers, setTeachers] = useState([]);
  const [classStats, setClassStats] = useState([]);
  const [events, setEvents] = useState([]);
  const [competitionsDisabled, setCompetitionsDisabled] = useState(false);
  const [teacherPagination, setTeacherPagination] = useState({ total: 0, limit: 25, offset: 0, hasMore: false });
  const [eventPagination, setEventPagination] = useState({ total: 0, limit: 25, offset: 0, hasMore: false });
  const [teacherQuery, setTeacherQuery] = useState("");

  // Event Form State
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventType, setNewEventType] = useState("mixed");
  const [newEventScope, setNewEventScope] = useState("school-wide");

  // ---- Create Teacher State ----
  const [teacherForm, setTeacherForm] = useState({ name: "", email: "", classAssigned: "", section: "" });
  const [teacherFormError, setTeacherFormError] = useState("");
  const [teacherFormLoading, setTeacherFormLoading] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState(null);
  const [showTempPassword, setShowTempPassword] = useState(false);
  const [copiedField, setCopiedField] = useState("");

  useEffect(() => {
    if (!isLoggedIn || !user) return;
    fetchOverview();
    fetchTeachers();
    fetchClasses();
    fetchEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn, user]);

  const fetchOverview = async () => {
    try {
      const data = await apiRequest("/api/principal/overview");
      if (data) setOverview(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchTeacherPage = async (nextOffset = 0) => {
    try {
      const limit = teacherPagination.limit || 25;
      const data = await apiRequest(
        `/api/principal/teachers?limit=${limit}&offset=${nextOffset}&q=${encodeURIComponent(teacherQuery || "")}`
      );
      const items = Array.isArray(data) ? data : data?.items || [];
      if (data) {
        setTeachers(items);
        setTeacherPagination((p) => ({ ...p, ...(data?.pagination || { total: 0, limit, offset: nextOffset, hasMore: false }) }));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchTeachers = async () => fetchTeacherPage(0);

  useEffect(() => {
    if (!isLoggedIn || !user) return;
    const t = setTimeout(() => fetchTeachers(), 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teacherQuery]);

  const [aiInsight, setAiInsight] = useState("");
  const [aiRefreshing, setAiRefreshing] = useState(false);
  const [selectedClassName, setSelectedClassName] = useState("");
  const [classInsight, setClassInsight] = useState("");
  const [classInsightLoading, setClassInsightLoading] = useState(false);

  useEffect(() => {
    if (!isLoggedIn || !user) return;
    if (activeTab === "overview" && !aiInsight) {
      apiRequest("/api/principal/ai-insights")
        .then((res) => {
          setAiInsight(res?.text || "");
          setAiRefreshing(res?.refreshing || false);
        })
        .catch(() => {});
    }
  }, [activeTab, aiInsight, isLoggedIn, user]);

  const fetchClassInsight = async (className) => {
    const cn = String(className || selectedClassName || "").trim();
    if (!cn) return;
    setClassInsightLoading(true);
    try {
      const res = await apiRequest(`/api/principal/ai-insights?className=${encodeURIComponent(cn)}`);
      setClassInsight(res?.text || "");
    } catch (e) {
      setClassInsight("Could not generate class insight right now.");
    } finally {
      setClassInsightLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      // This tab renders aggregate class insights (avg XP), not class roster.
      const data = await apiRequest("/api/principal/class-insights");
      if (data) setClassStats(data.classStats || []);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchEventPage = async (nextOffset = 0) => {
    try {
      const limit = eventPagination.limit || 25;
      const data = await apiRequest(`/api/principal/events?limit=${limit}&offset=${nextOffset}`);
      const items = Array.isArray(data) ? data : data?.items || [];
      if (data) {
        setCompetitionsDisabled(false);
        setEvents(items);
        setEventPagination((p) => ({ ...p, ...(data?.pagination || { total: 0, limit, offset: nextOffset, hasMore: false }) }));
      }
    } catch (e) {
      if (isFeatureDisabledError(e)) {
        setCompetitionsDisabled(true);
        setEvents([]);
        setEventPagination({ total: 0, limit: eventPagination.limit || 25, offset: 0, hasMore: false });
        return;
      }
      console.error(e);
    }
  };

  const fetchEvents = async () => fetchEventPage(0);

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    if (!newEventTitle) return;
    try {
      await apiRequest("/api/principal/events", {
        method: "POST",
        body: {
          title: newEventTitle,
          type: newEventType,
          scope: newEventScope
        }
      });
      setNewEventTitle("");
      fetchEvents();
      showAlert({ type: "success", message: "Event Created Successfully" });
    } catch (err) {
      if (isFeatureDisabledError(err)) {
        setCompetitionsDisabled(true);
        showAlert({ type: "error", message: "Competitions are currently disabled by admin." });
        return;
      }
      showAlert({ type: "error", message: "Failed to create event" });
    }
  };

  // ---- Create Teacher Handler ----
  const handleCreateTeacher = async (e) => {
    e.preventDefault();
    setTeacherFormError("");
    setCreatedCredentials(null);

    if (!teacherForm.name.trim()) return setTeacherFormError("Teacher name is required.");
    if (!teacherForm.email.trim()) return setTeacherFormError("Teacher email is required.");

    setTeacherFormLoading(true);
    try {
      const data = await apiRequest("/api/principal/create-teacher", {
        method: "POST",
        body: {
          name: teacherForm.name.trim(),
          email: teacherForm.email.trim(),
          classAssigned: teacherForm.classAssigned.trim(),
          section: teacherForm.section.trim(),
        },
      });
      setCreatedCredentials(data.credentials);
      setTeacherForm({ name: "", email: "", classAssigned: "", section: "" });
      setShowTempPassword(false);
      fetchTeachers();
      fetchOverview();
    } catch (err) {
      setTeacherFormError(err.message || "Failed to create teacher account.");
    } finally {
      setTeacherFormLoading(false);
    }
  };

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedField(field);
      setTimeout(() => setCopiedField(""), 2000);
    });
  };

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const topClass = classStats.length > 0 ? classStats[0] : null;
  const lowestClass = classStats.length > 0 ? classStats[classStats.length - 1] : null;

  const metricCards = [
    { label: "Total Students", value: overview.totalStudents, text: "Active accounts", icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Active Today", value: overview.activeStudentsToday, text: "Engagement pulse", icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Weekly XP Earned", value: overview.weeklyXp, text: "Platform-wide", icon: Lightbulb, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Tasks Completed", value: overview.tasksCompleted, text: "Total approvals", icon: CheckCircle, color: "text-purple-600", bg: "bg-purple-50" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-body flex transition-colors">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-xl z-10">
        <div className="p-6 border-b border-white/10 flex items-center gap-2">
          <EcoLogo className="w-8 h-8" withText={true} showTagline={false} />
          <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[10px] uppercase font-bold tracking-widest mt-1">Principal</span>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          {[
            { id: "overview", label: "School Overview", icon: TrendingUp },
            { id: "manage-teachers", label: "Manage Teachers", icon: UserPlus },
            { id: "teachers", label: "Teacher Performance", icon: Users },
            { id: "classes", label: "Class Insights", icon: AlertCircle },
            { id: "events", label: "Events & Competitions", icon: Award }
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
                activeTab === item.id 
                ? "bg-slate-800 text-emerald-400 shadow-sm" 
                : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="p-6 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 text-slate-400 hover:text-white w-full py-2 text-sm font-semibold transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* MAIN LAYOUT */}
      <main className="flex-1 overflow-y-auto">
        <header className="bg-white border-b border-slate-200 px-8 py-6 sticky top-0 z-10 shadow-sm">
          <h1 className="font-display font-bold text-2xl text-slate-800 tracking-tight capitalize">
            {activeTab.replace(/-/g, " ")}
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-1">
            {activeTab === "manage-teachers" 
              ? "Create and manage teacher accounts for your school." 
              : "Review metrics and key performance indicators."}
          </p>
        </header>
        
        <div className="p-8 max-w-6xl mx-auto space-y-8">
          
          {/* ====================== OVERVIEW TAB ====================== */}
          {activeTab === "overview" && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {metricCards.map((stat, i) => (
                  <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center`}>
                        <stat.icon className={`w-6 h-6 ${stat.color}`} />
                      </div>
                      <span className="text-xs font-bold px-2 py-1 rounded-full bg-slate-100 text-slate-600">
                        Live
                      </span>
                    </div>
                    <h3 className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-1">{stat.label}</h3>
                    <p className="font-display font-bold text-3xl text-slate-800">{stat.value.toLocaleString()}</p>
                    <p className="text-slate-400 text-xs font-medium mt-2">{stat.text}</p>
                  </div>
                ))}
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <h3 className="font-display font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-amber-500" /> Executive Insights
                  {aiRefreshing && <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-700 animate-pulse">Refreshing...</span>}
                </h3>
                
                {aiInsight ? (
                  <div className="mb-6 p-4 rounded-xl border border-amber-100 bg-amber-50 text-amber-900 font-medium leading-relaxed">
                    {aiInsight}
                  </div>
                ) : (
                  <div className="mb-6 animate-pulse text-slate-400 font-medium">Generating macro-insights...</div>
                )}

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                    <p className="text-sm font-semibold text-blue-800">Top Performing Class</p>
                    <p className="text-sm text-blue-600 mt-1">Class {topClass?._id || "N/A"} is leading the school in overall engagement and XP generation.</p>
                  </div>
                  <div className="bg-red-50 border border-red-100 rounded-xl p-4">
                    <p className="text-sm font-semibold text-red-800">Attention Required</p>
                    <p className="text-sm text-red-600 mt-1">Class {lowestClass?._id || "N/A"} requires monitoring for reduced engagement metrics.</p>
                  </div>
                </div>

                {/* Per-class insight */}
                <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-slate-800">Insight for a specific class</p>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">Select a class to generate a focused insight.</p>
                    </div>
                    <div className="flex gap-2">
                      <select
                        value={selectedClassName}
                        onChange={(e) => { setSelectedClassName(e.target.value); setClassInsight(""); }}
                        className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm font-semibold"
                      >
                        <option value="">Select class</option>
                        {classStats.map((c) => (
                          <option key={c._id} value={c._id}>
                            {c._id}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => fetchClassInsight(selectedClassName)}
                        disabled={!selectedClassName || classInsightLoading}
                        className="px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {classInsightLoading ? "Generating..." : "Generate"}
                      </button>
                    </div>
                  </div>

                  {classInsight ? (
                    <div className="mt-3 rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-700 font-medium">
                      {classInsight}
                    </div>
                  ) : null}
                </div>

                {/* All classes snapshot */}
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-bold text-slate-800">All classes</p>
                    <p className="text-xs text-slate-500 font-semibold">{classStats.length} classes</p>
                  </div>
                  {classStats.length === 0 ? (
                    <div className="text-sm text-slate-500">No class stats available yet.</div>
                  ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {classStats.map((c) => {
                        const isTop = String(c._id) === String(topClass?._id || "");
                        const isLow = String(c._id) === String(lowestClass?._id || "");
                        return (
                          <button
                            key={c._id}
                            onClick={() => { setSelectedClassName(String(c._id)); fetchClassInsight(String(c._id)); }}
                            className={`text-left rounded-xl border p-4 bg-white hover:shadow-sm transition ${
                              isTop ? "border-emerald-200" : isLow ? "border-rose-200" : "border-slate-200"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <p className="font-bold text-slate-800">Class {c._id}</p>
                              {isTop ? (
                                <span className="text-[10px] font-extrabold px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  Top
                                </span>
                              ) : isLow ? (
                                <span className="text-[10px] font-extrabold px-2 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                                  Attention
                                </span>
                              ) : (
                                <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-slate-50 text-slate-600 border border-slate-200">
                                  Normal
                                </span>
                              )}
                            </div>
                            <div className="mt-2 text-xs text-slate-600 font-semibold space-y-1">
                              <div className="flex items-center justify-between">
                                <span>Students</span>
                                <span className="text-slate-800">{Number(c.studentCount || 0)}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span>Avg XP</span>
                                <span className="text-slate-800">{Math.round(Number(c.avgXp || 0)).toLocaleString()}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span>Total XP</span>
                                <span className="text-slate-800">{Math.round(Number(c.totalXp || 0)).toLocaleString()}</span>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* ====================== MANAGE TEACHERS TAB ====================== */}
          {activeTab === "manage-teachers" && (
            <div className="grid md:grid-cols-5 gap-8">
              
              {/* Create Teacher Form */}
              <div className="md:col-span-2">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                  <h3 className="font-display font-bold text-lg text-slate-800 mb-6 flex items-center gap-2">
                    <UserPlus className="w-5 h-5 text-emerald-500" /> Add New Teacher
                  </h3>
                  
                  <form onSubmit={handleCreateTeacher} className="space-y-4">
                    {teacherFormError && (
                      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 font-medium">
                        {teacherFormError}
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Full Name *</label>
                      <input
                        type="text"
                        value={teacherForm.name}
                        onChange={(e) => setTeacherForm(f => ({ ...f, name: e.target.value }))}
                        className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                        placeholder="e.g. Mrs. Sharma"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Email Address *</label>
                      <input
                        type="email"
                        value={teacherForm.email}
                        onChange={(e) => setTeacherForm(f => ({ ...f, email: e.target.value }))}
                        className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                        placeholder="teacher@school.edu"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Class Assigned</label>
                        <input
                          type="text"
                          value={teacherForm.classAssigned}
                          onChange={(e) => setTeacherForm(f => ({ ...f, classAssigned: e.target.value }))}
                          className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                          placeholder="e.g. 10"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Section</label>
                        <input
                          type="text"
                          value={teacherForm.section}
                          onChange={(e) => setTeacherForm(f => ({ ...f, section: e.target.value.toUpperCase() }))}
                          className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                          placeholder="e.g. A"
                        />
                      </div>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                      <p className="text-xs text-slate-500 font-medium">
                        A <span className="font-bold text-slate-700">temporary password</span> will be auto-generated. 
                        The teacher must set a new password on their first login.
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={teacherFormLoading}
                      className="w-full bg-slate-900 text-white font-bold py-3 rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {teacherFormLoading ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4" />
                          Create Teacher Account
                        </>
                      )}
                    </button>
                  </form>
                </div>

                {/* Credentials Display Card */}
                {createdCredentials && (
                  <div className="mt-6 bg-emerald-50 rounded-2xl border-2 border-emerald-200 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-display font-bold text-lg text-emerald-900 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-emerald-600" /> Account Created!
                      </h4>
                      <button 
                        onClick={() => setCreatedCredentials(null)} 
                        className="text-emerald-600 hover:text-emerald-800 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <p className="text-sm text-emerald-700 mb-4 font-medium">
                      Share these credentials securely with the teacher. They will be required to set a new password on first login.
                    </p>

                    <div className="space-y-3">
                      <div className="bg-white rounded-xl p-3 border border-emerald-200 flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Email</p>
                          <p className="text-sm font-mono text-slate-800 truncate">{createdCredentials.email}</p>
                        </div>
                        <button 
                          onClick={() => copyToClipboard(createdCredentials.email, "email")} 
                          className="shrink-0 p-2 rounded-lg bg-emerald-100 hover:bg-emerald-200 transition-colors" 
                          title="Copy email"
                        >
                          <Copy className="w-4 h-4 text-emerald-700" />
                        </button>
                      </div>
                      {copiedField === "email" && <p className="text-xs text-emerald-600 font-bold ml-1">&#10003; Copied to clipboard</p>}

                      <div className="bg-white rounded-xl p-3 border border-emerald-200 flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Temporary Password</p>
                          <p className="text-sm font-mono text-slate-800">
                            {showTempPassword ? createdCredentials.temporaryPassword : "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button 
                            onClick={() => setShowTempPassword(!showTempPassword)} 
                            className="p-2 rounded-lg bg-emerald-100 hover:bg-emerald-200 transition-colors"
                            title={showTempPassword ? "Hide password" : "Reveal password"}
                          >
                            {showTempPassword ? <EyeOff className="w-4 h-4 text-emerald-700" /> : <Eye className="w-4 h-4 text-emerald-700" />}
                          </button>
                          <button 
                            onClick={() => copyToClipboard(createdCredentials.temporaryPassword, "password")} 
                            className="p-2 rounded-lg bg-emerald-100 hover:bg-emerald-200 transition-colors" 
                            title="Copy password"
                          >
                            <Copy className="w-4 h-4 text-emerald-700" />
                          </button>
                        </div>
                      </div>
                      {copiedField === "password" && <p className="text-xs text-emerald-600 font-bold ml-1">&#10003; Copied to clipboard</p>}
                    </div>

                    <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-3">
                      <p className="text-xs text-amber-800 font-semibold">
                        &#9888; This password will NOT be shown again. Make sure to save or share it now.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Teachers List */}
              <div className="md:col-span-3">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="p-6 border-b border-slate-200 flex items-center justify-between">
                    <h3 className="font-display font-bold text-lg text-slate-800">School Teachers</h3>
                    <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold">
                      {teachers.length} teacher{teachers.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-50 text-xs uppercase font-bold text-slate-500">
                      <tr>
                        <th className="p-4 pl-6">Name</th>
                        <th className="p-4">Email</th>
                        <th className="p-4">Tasks Created</th>
                        <th className="p-4 text-right pr-6">Score</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {teachers.map((t, i) => (
                        <tr key={t._id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-4 pl-6 font-semibold text-slate-800 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">
                              {t.name.charAt(0)}
                            </div>
                            {t.name}
                            {i === 0 && <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px] uppercase font-bold tracking-widest">Top</span>}
                          </td>
                          <td className="p-4">{t.email}</td>
                          <td className="p-4 font-mono">{t.tasksCreated}</td>
                          <td className="p-4 text-right pr-6 font-bold text-emerald-600">{t.engagementScore}</td>
                        </tr>
                      ))}
                      {teachers.length === 0 && (
                        <tr>
                          <td colSpan="4" className="p-8 text-center text-slate-400">
                            No teachers yet. Create one using the form on the left.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ====================== TEACHER PERFORMANCE ====================== */}
          {activeTab === "teachers" && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h3 className="font-display font-bold text-lg text-slate-800">Teacher Leaderboard &amp; Engagement</h3>
                  <p className="text-xs text-slate-500 font-semibold mt-1">
                    Showing {teacherPagination.offset + 1}-{Math.min(teacherPagination.offset + teachers.length, teacherPagination.total || teachers.length)} of {teacherPagination.total || teachers.length}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    value={teacherQuery}
                    onChange={(e) => setTeacherQuery(e.target.value)}
                    placeholder="Search teachers…"
                    className="w-full sm:w-64 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-slate-900 outline-none"
                  />
                  <button
                    disabled={teacherPagination.offset <= 0}
                    onClick={() => fetchTeacherPage(Math.max(0, teacherPagination.offset - teacherPagination.limit))}
                    className="px-3 py-2 rounded-lg border border-slate-300 text-sm font-bold disabled:opacity-40"
                  >
                    Prev
                  </button>
                  <button
                    disabled={!teacherPagination.hasMore}
                    onClick={() => fetchTeacherPage(teacherPagination.offset + teacherPagination.limit)}
                    className="px-3 py-2 rounded-lg border border-slate-300 text-sm font-bold disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-xs uppercase font-bold text-slate-500">
                  <tr>
                    <th className="p-4 pl-6">Teacher Name</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Tasks Created</th>
                    <th className="p-4">Engagement Score</th>
                    <th className="p-4 text-right pr-6">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {teachers.map((t, i) => (
                    <tr key={t._id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 pl-6 font-semibold text-slate-800 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">
                          {t.name.charAt(0)}
                        </div>
                        {t.name}
                        {i === 0 && <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px] uppercase font-bold tracking-widest">Top</span>}
                      </td>
                      <td className="p-4">{t.email}</td>
                      <td className="p-4 font-mono">{t.tasksCreated}</td>
                      <td className="p-4 font-bold text-emerald-600">{t.engagementScore}</td>
                      <td className="p-4 text-right pr-6">
                        <button className="text-slate-400 hover:text-blue-600 transition-colors" title="Send Reminder">
                          <Mail className="w-5 h-5 ml-auto" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {teachers.length === 0 && (
                    <tr><td colSpan="5" className="p-8 text-center text-slate-400">No teachers found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* ====================== CLASS INSIGHTS ====================== */}
          {activeTab === "classes" && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <h3 className="font-display font-bold text-lg text-slate-800 mb-6 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-500" /> Class XP Averages
                </h3>
                <div className="space-y-5">
                  {classStats.map((cls, i) => {
                    const maxVal = Math.max(...classStats.map(c => c.avgXp), 1);
                    const pct = (cls.avgXp / maxVal) * 100;
                    return (
                    <div key={cls._id}>
                      <div className="flex justify-between items-end mb-1">
                        <span className="font-bold text-sm text-slate-700">Class {cls._id}</span>
                        <span className="font-bold text-sm text-slate-500">{Math.round(cls.avgXp)} XP / student</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${i === 0 ? "bg-emerald-500" : i === classStats.length - 1 ? "bg-rose-500" : "bg-blue-500"}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )})}
                  {classStats.length === 0 && <p className="text-slate-400 text-center py-4">No data available.</p>}
                </div>
              </div>
            </div>
          )}

          {/* ====================== EVENTS & COMPETITIONS ====================== */}
          {activeTab === "events" && (
            <div className="grid md:grid-cols-3 gap-6">
              {competitionsDisabled && (
                <div className="md:col-span-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-800 font-semibold">
                  Competitions are currently disabled by admin.
                </div>
              )}
              <div className="md:col-span-1 bg-white rounded-2xl shadow-sm border border-slate-200 p-6 h-fit">
                <h3 className="font-display font-bold text-lg text-slate-800 mb-6 flex items-center gap-2">
                  <CalendarPlus className="w-5 h-5 text-purple-500" /> Launch Event
                </h3>
                <form onSubmit={handleCreateEvent} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Event Name</label>
                    <input 
                      value={newEventTitle} onChange={e => setNewEventTitle(e.target.value)}
                      disabled={competitionsDisabled}
                      className="w-full border border-slate-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-slate-900 outline-none" 
                      placeholder="e.g. Earth Week Challenge" required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Type</label>
                    <select 
                      value={newEventType} onChange={e => setNewEventType(e.target.value)}
                      disabled={competitionsDisabled}
                      className="w-full border border-slate-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-slate-900 outline-none"
                    >
                      <option value="mixed">Mixed Activities</option>
                      <option value="quiz">Quiz Blitz</option>
                      <option value="task">Real-World Tasks</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Scope</label>
                    <select 
                      value={newEventScope} onChange={e => setNewEventScope(e.target.value)}
                      disabled={competitionsDisabled}
                      className="w-full border border-slate-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-slate-900 outline-none"
                    >
                      <option value="school-wide">School Wide</option>
                      <option value="class">Inter-Class Duel</option>
                    </select>
                  </div>
                  <button type="submit" disabled={competitionsDisabled} className="w-full bg-slate-900 text-white font-bold py-2.5 rounded-lg hover:bg-slate-800 mt-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    Publish Event
                  </button>
                </form>
              </div>

              <div className="md:col-span-2 space-y-4">
                {events.map((ev) => (
                  <div key={ev._id} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:shadow-md transition-shadow">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 text-[10px] uppercase font-bold tracking-widest">{ev.status}</span>
                        <span className="text-xs text-slate-500 font-bold uppercase">{ev.type}</span>
                      </div>
                      <h4 className="font-display font-bold text-lg text-slate-800">{ev.title}</h4>
                      <p className="text-sm text-slate-500 mt-1">Scope: {ev.scope}</p>
                    </div>
                    <div className="bg-slate-50 px-4 py-2 rounded-xl text-center border border-slate-100 min-w-[120px]">
                      <p className="text-xs font-bold text-slate-500 uppercase mb-0.5">Participation</p>
                      <p className="font-bold text-emerald-600 text-lg">
                        {typeof ev.participationRate === "number" ? `${Math.round(ev.participationRate)}%` : "N/A"}
                      </p>
                    </div>
                  </div>
                ))}
                {events.length === 0 && (
                  <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-500">
                    No active events or competitions.
                  </div>
                )}
                {(eventPagination.total || 0) > 0 && (
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <span className="text-xs text-slate-500 font-semibold">
                      Showing {eventPagination.offset + 1}-{Math.min(eventPagination.offset + events.length, eventPagination.total)} of {eventPagination.total}
                    </span>
                    <div className="flex gap-2">
                      <button
                        disabled={eventPagination.offset <= 0}
                        onClick={() => fetchEventPage(Math.max(0, eventPagination.offset - eventPagination.limit))}
                        className="px-3 py-2 rounded-lg border border-slate-300 text-sm font-bold disabled:opacity-40"
                      >
                        Prev
                      </button>
                      <button
                        disabled={!eventPagination.hasMore}
                        onClick={() => fetchEventPage(eventPagination.offset + eventPagination.limit)}
                        className="px-3 py-2 rounded-lg border border-slate-300 text-sm font-bold disabled:opacity-40"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
