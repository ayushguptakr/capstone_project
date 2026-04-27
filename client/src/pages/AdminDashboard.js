import React, { useEffect, useState } from "react";
import {
  Users,
  School,
  Activity,
  UserCheck,
  GraduationCap,
  Briefcase,
  Crown,
  ToggleLeft,
} from "lucide-react";
import { apiRequest } from "../api/httpClient";
import { useAuth } from "../context/AuthContext";
import "./AdminPanel.css";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [toggles, setToggles] = useState({ competitions: true, rewards: true });
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    fetchStats();
    fetchToggles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchStats = async () => {
    try {
      const data = await apiRequest("/api/admin/stats");
      if (data) setStats(data);
    } catch (err) {
      console.error("Failed to fetch stats", err);
    }
  };

  const fetchToggles = async () => {
    try {
      const data = await apiRequest("/api/admin/feature-toggles");
      if (data) setToggles(data.toggles || { competitions: true, rewards: true });
    } catch (err) {
      console.error("Failed to fetch toggles", err);
    }
  };

  const handleToggle = async (key) => {
    const updated = { ...toggles, [key]: !toggles[key] };
    setToggles(updated);
    setSaving(true);
    try {
      const res = await apiRequest("/api/admin/feature-toggles", {
        method: "PUT",
        body: { [key]: updated[key] },
      });
      if (!res) setToggles(toggles); // revert if request dropped

    } catch (err) {
      console.error("Failed to update toggle", err);
      setToggles(toggles); // revert
    } finally {
      setSaving(false);
    }
  };

  const roleMeta = [
    { key: "student", label: "Students", icon: GraduationCap, bg: "#d1fae5", color: "#065f46" },
    { key: "teacher", label: "Teachers", icon: Briefcase, bg: "#dbeafe", color: "#1d4ed8" },
    { key: "principal", label: "Principals", icon: Crown, bg: "#ede9fe", color: "#6d28d9" },
    { key: "admin", label: "Admins", icon: UserCheck, bg: "#fee2e2", color: "#b91c1c" },
  ];

  return (
    <>
      <header className="admin-header">
        <h1>Dashboard</h1>
        <p>Platform overview and system controls.</p>
      </header>

      <div className="admin-content">
        {/* -------- Stat Cards -------- */}
        <div className="admin-section">
          <div className="admin-grid-4">
            <div className="admin-card admin-card--stat">
              <div className="stat-icon" style={{ background: "#dbeafe" }}>
                <Users style={{ width: 22, height: 22, color: "#1d4ed8" }} />
              </div>
              <span className="stat-label">Total Users</span>
              <span className="stat-value">{stats?.totalUsers ?? "—"}</span>
            </div>
            <div className="admin-card admin-card--stat">
              <div className="stat-icon" style={{ background: "#d1fae5" }}>
                <School style={{ width: 22, height: 22, color: "#065f46" }} />
              </div>
              <span className="stat-label">Active Schools</span>
              <span className="stat-value">{stats?.totalSchools ?? "—"}</span>
            </div>
            <div className="admin-card admin-card--stat">
              <div className="stat-icon" style={{ background: "#fef3c7" }}>
                <Activity style={{ width: 22, height: 22, color: "#92400e" }} />
              </div>
              <span className="stat-label">Active Users (7d)</span>
              <span className="stat-value">{stats?.activeUsers ?? "—"}</span>
            </div>
          </div>
        </div>

        {/* -------- Users by Role -------- */}
        <div className="admin-section">
          <h3 className="admin-section-title">
            <UserCheck style={{ width: 20, height: 20 }} /> Users by Role
          </h3>
          <div className="admin-grid-4">
            {roleMeta.map((r) => (
              <div key={r.key} className="admin-card admin-card--stat">
                <div className="stat-icon" style={{ background: r.bg }}>
                  <r.icon style={{ width: 20, height: 20, color: r.color }} />
                </div>
                <span className="stat-label">{r.label}</span>
                <span className="stat-value">{stats?.byRole?.[r.key] ?? 0}</span>
              </div>
            ))}
          </div>
        </div>

        {/* -------- Feature Toggles -------- */}
        <div className="admin-section">
          <h3 className="admin-section-title">
            <ToggleLeft style={{ width: 20, height: 20 }} /> Feature Toggles
          </h3>
          <div className="admin-card">
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {[
                { key: "competitions", label: "Competitions", desc: "Enable or disable platform-wide competitions and events." },
                { key: "rewards", label: "Rewards & Eco Store", desc: "Enable or disable the reward redemption system." },
              ].map((item) => (
                <div
                  key={item.key}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "12px 0",
                    borderBottom: "1px solid #f1f5f9",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, color: "#1e293b", fontSize: "0.9rem" }}>{item.label}</div>
                    <div style={{ fontSize: "0.8rem", color: "#64748b", marginTop: 2 }}>{item.desc}</div>
                  </div>
                  <label className="admin-toggle">
                    <input
                      type="checkbox"
                      checked={toggles[item.key]}
                      onChange={() => handleToggle(item.key)}
                      disabled={saving}
                    />
                    <span className="admin-toggle__slider" />
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
