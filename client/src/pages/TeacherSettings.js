import React, { useEffect, useState } from "react";
import { Bell, KeyRound, Save, UserCircle2 } from "lucide-react";
import TeacherShell from "../components/TeacherShell";
import { apiRequest } from "../api/httpClient";
import { useAuth } from "../context/AuthContext";

export default function TeacherSettings() {
  const { user, setUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    classAssigned: "",
    section: "",
  });
  const [prefs, setPrefs] = useState({
    emailAnnouncements: true,
    submissionAlerts: true,
    weeklyDigest: false,
  });
  const [passwordForm, setPasswordForm] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [themeMode, setThemeMode] = useState("premium");

  useEffect(() => {
    const stored = localStorage.getItem("eco_teacher_prefs");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setPrefs((p) => ({ ...p, ...parsed }));
      } catch {
        // ignore invalid local preference payload
      }
    }
  }, []);

  useEffect(() => {
    const storedTheme = localStorage.getItem("eco_teacher_theme");
    if (storedTheme === "classic" || storedTheme === "premium") {
      setThemeMode(storedTheme);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const me = await apiRequest("/api/auth/me");
        if (!mounted) return;
        const u = me?.user || user || {};
        setProfile({
          name: u.name || "",
          email: u.email || "",
          classAssigned: u.classAssigned || u.className || u.class || "",
          section: u.section || "",
        });
      } catch {
        if (!mounted) return;
        const u = user || {};
        setProfile({
          name: u.name || "",
          email: u.email || "",
          classAssigned: u.classAssigned || u.className || u.class || "",
          section: u.section || "",
        });
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [user]);

  const flash = (text) => {
    setMsg(text);
    setTimeout(() => setMsg(""), 2200);
  };

  const saveProfile = async () => {
    setSavingProfile(true);
    try {
      // No dedicated backend endpoint yet; keep UI state in auth context/local for now.
      setUser((prev) => ({
        ...prev,
        name: profile.name,
        classAssigned: profile.classAssigned,
        section: profile.section,
      }));
      flash("Profile preferences saved.");
    } finally {
      setSavingProfile(false);
    }
  };

  const savePrefs = async () => {
    setSavingPrefs(true);
    try {
      localStorage.setItem("eco_teacher_prefs", JSON.stringify(prefs));
      flash("Notification preferences updated.");
    } finally {
      setSavingPrefs(false);
    }
  };

  const changePassword = async () => {
    if (!passwordForm.newPassword || passwordForm.newPassword.length < 6) {
      flash("Password must be at least 6 characters.");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      flash("Password confirmation does not match.");
      return;
    }

    setSavingPassword(true);
    try {
      await apiRequest("/api/auth/set-password", {
        method: "POST",
        body: { password: passwordForm.newPassword },
        retries: 0,
      });
      setPasswordForm({ newPassword: "", confirmPassword: "" });
      flash("Password updated successfully.");
    } catch (e) {
      flash(e.message || "Failed to update password.");
    } finally {
      setSavingPassword(false);
    }
  };

  const saveTheme = () => {
    localStorage.setItem("eco_teacher_theme", themeMode);
    window.dispatchEvent(new Event("eco-teacher-theme-change"));
    flash(`Theme updated to ${themeMode}.`);
  };

  return (
    <TeacherShell title="Settings" subtitle="Workspace preferences and account-level controls.">
      {msg ? <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">{msg}</div> : null}

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">
          Loading settings...
        </div>
      ) : (
        <div className="grid xl:grid-cols-3 gap-4">
          <div className="xl:col-span-2 space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="font-display font-bold text-lg flex items-center gap-2">
                <UserCircle2 className="w-5 h-5 text-emerald-600" />
                Profile
              </h3>
              <p className="text-sm text-slate-600 mt-1">Basic teacher identity and class context.</p>
              <div className="grid sm:grid-cols-2 gap-3 mt-4">
                <input
                  value={profile.name}
                  onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
                  placeholder="Full name"
                  className="rounded-xl border border-slate-200 px-3 py-2"
                />
                <input value={profile.email} disabled className="rounded-xl border border-slate-200 px-3 py-2 bg-slate-50 text-slate-500" />
                <input
                  value={profile.classAssigned}
                  onChange={(e) => setProfile((p) => ({ ...p, classAssigned: e.target.value }))}
                  placeholder="Class assigned"
                  className="rounded-xl border border-slate-200 px-3 py-2"
                />
                <input
                  value={profile.section}
                  onChange={(e) => setProfile((p) => ({ ...p, section: e.target.value }))}
                  placeholder="Section"
                  className="rounded-xl border border-slate-200 px-3 py-2"
                />
              </div>
              <button
                onClick={saveProfile}
                disabled={savingProfile}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-600 text-white px-4 py-2 font-semibold disabled:opacity-60"
              >
                <Save className="w-4 h-4" /> {savingProfile ? "Saving..." : "Save Profile"}
              </button>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="font-display font-bold text-lg flex items-center gap-2">
                <Bell className="w-5 h-5 text-indigo-600" />
                Notifications
              </h3>
              <p className="text-sm text-slate-600 mt-1">Choose how you want to be notified.</p>
              <div className="mt-4 space-y-3">
                {[
                  { key: "emailAnnouncements", label: "Email me school announcements" },
                  { key: "submissionAlerts", label: "Notify on new student submissions" },
                  { key: "weeklyDigest", label: "Weekly performance digest" },
                ].map((item) => (
                  <label key={item.key} className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-2">
                    <span className="text-sm font-medium text-slate-700">{item.label}</span>
                    <input
                      type="checkbox"
                      checked={Boolean(prefs[item.key])}
                      onChange={(e) => setPrefs((p) => ({ ...p, [item.key]: e.target.checked }))}
                      className="h-4 w-4"
                    />
                  </label>
                ))}
              </div>
              <button
                onClick={savePrefs}
                disabled={savingPrefs}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-indigo-600 text-white px-4 py-2 font-semibold disabled:opacity-60"
              >
                <Save className="w-4 h-4" /> {savingPrefs ? "Saving..." : "Save Preferences"}
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="font-display font-bold text-lg">Appearance</h3>
              <p className="text-sm text-slate-600 mt-1">Choose your teacher workspace style.</p>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setThemeMode("classic")}
                  className={`rounded-xl border px-3 py-2 text-sm font-semibold ${
                    themeMode === "classic"
                      ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                      : "border-slate-200 bg-white text-slate-700"
                  }`}
                >
                  Classic
                </button>
                <button
                  type="button"
                  onClick={() => setThemeMode("premium")}
                  className={`rounded-xl border px-3 py-2 text-sm font-semibold ${
                    themeMode === "premium"
                      ? "border-indigo-300 bg-indigo-50 text-indigo-700"
                      : "border-slate-200 bg-white text-slate-700"
                  }`}
                >
                  Premium
                </button>
              </div>
              <button
                onClick={saveTheme}
                className="mt-4 w-full rounded-xl bg-slate-900 text-white px-4 py-2 font-semibold"
              >
                Save Theme
              </button>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="font-display font-bold text-lg flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-amber-600" />
                Security
              </h3>
              <p className="text-sm text-slate-600 mt-1">Update your account password.</p>
              <div className="space-y-2 mt-4">
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm((p) => ({ ...p, newPassword: e.target.value }))}
                  placeholder="New password"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2"
                />
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                  placeholder="Confirm new password"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2"
                />
              </div>
              <button
                onClick={changePassword}
                disabled={savingPassword}
                className="mt-4 w-full rounded-xl bg-amber-600 text-white px-4 py-2 font-semibold disabled:opacity-60"
              >
                {savingPassword ? "Updating..." : "Update Password"}
              </button>
            </div>
          </div>
        </div>
      )}
    </TeacherShell>
  );
}
