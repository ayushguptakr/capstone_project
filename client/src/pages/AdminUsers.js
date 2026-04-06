import React, { useEffect, useState } from "react";
import { Plus, Trash2, ArrowRightLeft, Shield, X } from "lucide-react";
import { apiRequest } from "../api/httpClient";
import "./AdminPanel.css";

const ROLE_OPTIONS = ["student", "teacher", "principal"];
const ALL_ROLES = ["all", "student", "teacher", "principal", "admin"];

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState("all");

  // Create user
  const [showCreate, setShowCreate] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createEmail, setCreateEmail] = useState("");
  const [createPassword, setCreatePassword] = useState("");
  const [createRole, setCreateRole] = useState("student");
  const [createSchoolId, setCreateSchoolId] = useState("");

  // Edit role modal
  const [roleUser, setRoleUser] = useState(null);
  const [newRole, setNewRole] = useState("");

  // Transfer school modal
  const [transferUser, setTransferUser] = useState(null);
  const [newSchoolId, setNewSchoolId] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchUsers();
    fetchSchools();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await apiRequest("/api/admin/users");
      setUsers(data.users || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSchools = async () => {
    try {
      const data = await apiRequest("/api/admin/schools");
      setSchools(data.schools || []);
    } catch (err) {
      console.error(err);
    }
  };

  // ---- Create User ----
  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await apiRequest("/api/admin/users", {
        method: "POST",
        body: {
          name: createName,
          email: createEmail,
          password: createPassword,
          role: createRole,
          schoolId: createSchoolId || undefined,
        },
      });
      setCreateName("");
      setCreateEmail("");
      setCreatePassword("");
      setCreateRole("student");
      setCreateSchoolId("");
      setShowCreate(false);
      setSuccess("User created successfully. They will set their password on first login.");
      fetchUsers();
      setTimeout(() => setSuccess(""), 4000);
    } catch (err) {
      setError(err.message || "Failed to create user.");
    }
  };

  // ---- Update Role ----
  const openRoleModal = (user) => {
    setRoleUser(user);
    setNewRole(user.role);
    setError("");
  };

  const handleUpdateRole = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await apiRequest(`/api/admin/users/${roleUser._id}/role`, {
        method: "PUT",
        body: { role: newRole },
      });
      setRoleUser(null);
      setSuccess("Role updated.");
      fetchUsers();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message || "Failed to update role.");
    }
  };

  // ---- Transfer School ----
  const openTransferModal = (user) => {
    setTransferUser(user);
    setNewSchoolId(user.schoolId?._id || "");
    setError("");
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    setError("");
    if (!newSchoolId) {
      setError("Please select a school.");
      return;
    }
    try {
      await apiRequest(`/api/admin/users/${transferUser._id}/transfer`, {
        method: "PUT",
        body: { schoolId: newSchoolId },
      });
      setTransferUser(null);
      setSuccess("User transferred to new school.");
      fetchUsers();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message || "Failed to transfer user.");
    }
  };

  // ---- Delete ----
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this user?")) return;
    try {
      await apiRequest(`/api/admin/users/${id}`, { method: "DELETE" });
      setSuccess("User deleted.");
      fetchUsers();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message || "Failed to delete user.");
    }
  };

  // ---- Filtering ----
  const filtered = roleFilter === "all" ? users : users.filter((u) => u.role === roleFilter);

  return (
    <>
      <header className="admin-header">
        <h1>Users</h1>
        <p>Add, edit roles, transfer between schools, or remove users.</p>
      </header>

      <div className="admin-content">
        {success && <div className="admin-alert admin-alert--success">{success}</div>}
        {error && !roleUser && !transferUser && !showCreate && (
          <div className="admin-alert admin-alert--error">{error}</div>
        )}

        {/* -------- Create User -------- */}
        <div className="admin-section">
          {!showCreate ? (
            <button className="admin-btn admin-btn--primary" onClick={() => { setShowCreate(true); setError(""); }}>
              <Plus style={{ width: 16, height: 16 }} /> Add User
            </button>
          ) : (
            <div className="admin-card" style={{ maxWidth: 560 }}>
              <h3 className="admin-section-title">
                <Plus style={{ width: 18, height: 18 }} /> New User
              </h3>
              {error && <div className="admin-alert admin-alert--error">{error}</div>}
              <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div className="admin-form-group">
                  <label className="admin-label">Full Name</label>
                  <input
                    className="admin-input"
                    value={createName}
                    onChange={(e) => setCreateName(e.target.value)}
                    placeholder="Enter full name"
                    required
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-label">Email</label>
                  <input
                    type="email"
                    className="admin-input"
                    value={createEmail}
                    onChange={(e) => setCreateEmail(e.target.value)}
                    placeholder="user@school.edu"
                    required
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-label">Temporary Password</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={createPassword}
                    onChange={(e) => setCreatePassword(e.target.value)}
                    placeholder="temp1234"
                    required
                    style={{ fontFamily: "monospace" }}
                  />
                </div>
                <div className="admin-grid-2">
                  <div className="admin-form-group">
                    <label className="admin-label">Role</label>
                    <select
                      className="admin-select"
                      value={createRole}
                      onChange={(e) => setCreateRole(e.target.value)}
                    >
                      {ROLE_OPTIONS.map((r) => (
                        <option key={r} value={r}>
                          {r.charAt(0).toUpperCase() + r.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-label">School (optional)</label>
                    <select
                      className="admin-select"
                      value={createSchoolId}
                      onChange={(e) => setCreateSchoolId(e.target.value)}
                    >
                      <option value="">— No School —</option>
                      {schools
                        .filter((s) => s.status !== "inactive")
                        .map((s) => (
                          <option key={s._id} value={s._id}>
                            {s.name}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                  <button type="submit" className="admin-btn admin-btn--primary">Create User</button>
                  <button type="button" className="admin-btn admin-btn--secondary" onClick={() => setShowCreate(false)}>Cancel</button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* -------- Filter + Table -------- */}
        <div className="admin-section">
          <div className="admin-toolbar">
            <div className="admin-filter-tabs">
              {ALL_ROLES.map((r) => (
                <button
                  key={r}
                  className={`admin-filter-tab${roleFilter === r ? " admin-filter-tab--active" : ""}`}
                  onClick={() => setRoleFilter(r)}
                >
                  {r === "all" ? "All" : r.charAt(0).toUpperCase() + r.slice(1)}
                </button>
              ))}
            </div>
            <span className="admin-toolbar__count">{filtered.length} users</span>
          </div>

          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>School</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u._id}>
                    <td className="bold">{u.name}</td>
                    <td>{u.email}</td>
                    <td>
                      <span className={`admin-role-badge admin-role-badge--${u.role}`}>
                        {u.role}
                      </span>
                    </td>
                    <td>
                      {u.schoolId?.name || (
                        <span style={{ color: "#94a3b8", fontStyle: "italic" }}>None</span>
                      )}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      {u.role !== "admin" && (
                        <div style={{ display: "flex", gap: 4, justifyContent: "flex-end" }}>
                          <button
                            className="admin-btn--icon"
                            onClick={() => openRoleModal(u)}
                            title="Change Role"
                          >
                            <Shield style={{ width: 16, height: 16 }} />
                          </button>
                          <button
                            className="admin-btn--icon"
                            onClick={() => openTransferModal(u)}
                            title="Transfer School"
                          >
                            <ArrowRightLeft style={{ width: 16, height: 16 }} />
                          </button>
                          <button
                            className="admin-btn--icon admin-btn--icon-danger"
                            onClick={() => handleDelete(u._id)}
                            title="Delete User"
                          >
                            <Trash2 style={{ width: 16, height: 16 }} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {!loading && filtered.length === 0 && (
                  <tr>
                    <td colSpan="5" className="admin-empty">
                      {roleFilter === "all" ? "No users found." : `No ${roleFilter}s found.`}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* -------- Change Role Modal -------- */}
        {roleUser && (
          <div className="admin-modal-overlay" onClick={() => setRoleUser(null)}>
            <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
              <button className="admin-modal__close" onClick={() => setRoleUser(null)}>
                <X style={{ width: 20, height: 20 }} />
              </button>
              <h3>Change Role</h3>
              <p>
                Update role for <strong>{roleUser.name}</strong> ({roleUser.email})
              </p>
              {error && <div className="admin-alert admin-alert--error">{error}</div>}
              <form onSubmit={handleUpdateRole} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div className="admin-form-group">
                  <label className="admin-label">New Role</label>
                  <select className="admin-select" value={newRole} onChange={(e) => setNewRole(e.target.value)}>
                    {ROLE_OPTIONS.map((r) => (
                      <option key={r} value={r}>
                        {r.charAt(0).toUpperCase() + r.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <button type="submit" className="admin-btn admin-btn--primary" style={{ marginTop: 6 }}>
                  Update Role
                </button>
              </form>
            </div>
          </div>
        )}

        {/* -------- Transfer School Modal -------- */}
        {transferUser && (
          <div className="admin-modal-overlay" onClick={() => setTransferUser(null)}>
            <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
              <button className="admin-modal__close" onClick={() => setTransferUser(null)}>
                <X style={{ width: 20, height: 20 }} />
              </button>
              <h3>Transfer School</h3>
              <p>
                Move <strong>{transferUser.name}</strong> to a different school.
              </p>
              {error && <div className="admin-alert admin-alert--error">{error}</div>}
              <form onSubmit={handleTransfer} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div className="admin-form-group">
                  <label className="admin-label">Target School</label>
                  <select
                    className="admin-select"
                    value={newSchoolId}
                    onChange={(e) => setNewSchoolId(e.target.value)}
                  >
                    <option value="">— Select a School —</option>
                    {schools
                      .filter((s) => s.status !== "inactive")
                      .map((s) => (
                        <option key={s._id} value={s._id}>
                          {s.name}
                        </option>
                      ))}
                  </select>
                </div>
                <button type="submit" className="admin-btn admin-btn--primary" style={{ marginTop: 6 }}>
                  Transfer User
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
