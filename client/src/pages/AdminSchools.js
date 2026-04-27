import React, { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, UserPlus, X } from "lucide-react";
import { apiRequest } from "../api/httpClient";
import { useAuth } from "../context/AuthContext";
import "./AdminPanel.css";

export default function AdminSchools() {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, isLoggedIn } = useAuth();

  // Create school form
  const [showCreate, setShowCreate] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createAddress, setCreateAddress] = useState("");

  // Edit school modal
  const [editSchool, setEditSchool] = useState(null);
  const [editName, setEditName] = useState("");
  const [editAddress, setEditAddress] = useState("");

  // Assign principal modal
  const [assignSchoolId, setAssignSchoolId] = useState(null);
  const [principalName, setPrincipalName] = useState("");
  const [principalEmail, setPrincipalEmail] = useState("");
  const [principalPassword, setPrincipalPassword] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!isLoggedIn || !user) return;
    fetchSchools();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn, user]);

  const fetchSchools = async () => {
    try {
      const data = await apiRequest("/api/admin/schools");
      if (data) setSchools(data.schools || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ---- Create ----
  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");
    if (!createName.trim()) return;
    try {
      await apiRequest("/api/admin/schools", {
        method: "POST",
        body: { name: createName, address: createAddress },
      });
      setCreateName("");
      setCreateAddress("");
      setShowCreate(false);
      setSuccess("School created successfully.");
      fetchSchools();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message || "Failed to create school.");
    }
  };

  // ---- Edit ----
  const openEdit = (school) => {
    setEditSchool(school);
    setEditName(school.name);
    setEditAddress(school.address || "");
    setError("");
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await apiRequest(`/api/admin/schools/${editSchool._id}`, {
        method: "PUT",
        body: { name: editName, address: editAddress },
      });
      setEditSchool(null);
      setSuccess("School updated.");
      fetchSchools();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message || "Failed to update school.");
    }
  };

  // ---- Delete (soft) ----
  const handleDelete = async (id) => {
    if (!window.confirm("Deactivate this school? It will be marked as inactive.")) return;
    try {
      await apiRequest(`/api/admin/schools/${id}`, { method: "DELETE" });
      setSuccess("School deactivated.");
      fetchSchools();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message || "Failed to deactivate school.");
    }
  };

  // ---- Assign Principal ----
  const openAssign = (schoolId) => {
    setAssignSchoolId(schoolId);
    setPrincipalName("");
    setPrincipalEmail("");
    setPrincipalPassword("");
    setError("");
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await apiRequest("/api/admin/schools/assign", {
        method: "POST",
        body: {
          schoolId: assignSchoolId,
          name: principalName,
          email: principalEmail,
          password: principalPassword,
        },
      });
      setAssignSchoolId(null);
      setSuccess("Principal created and assigned!");
      fetchSchools();
      setTimeout(() => setSuccess(""), 4000);
    } catch (err) {
      setError(err.message || "Failed to assign principal.");
    }
  };

  return (
    <>
      <header className="admin-header">
        <h1>Schools</h1>
        <p>Create, edit, and manage schools on the platform.</p>
      </header>

      <div className="admin-content">
        {success && <div className="admin-alert admin-alert--success">{success}</div>}
        {error && !editSchool && !assignSchoolId && (
          <div className="admin-alert admin-alert--error">{error}</div>
        )}

        {/* -------- Create School Section -------- */}
        <div className="admin-section">
          {!showCreate ? (
            <button className="admin-btn admin-btn--primary" onClick={() => setShowCreate(true)}>
              <Plus style={{ width: 16, height: 16 }} /> Add School
            </button>
          ) : (
            <div className="admin-card" style={{ maxWidth: 560 }}>
              <h3 className="admin-section-title">
                <Plus style={{ width: 18, height: 18 }} /> New School
              </h3>
              <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div className="admin-form-group">
                  <label className="admin-label">School Name</label>
                  <input
                    className="admin-input"
                    value={createName}
                    onChange={(e) => setCreateName(e.target.value)}
                    placeholder="Enter school name"
                    required
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-label">Address</label>
                  <input
                    className="admin-input"
                    value={createAddress}
                    onChange={(e) => setCreateAddress(e.target.value)}
                    placeholder="Enter school address (optional)"
                  />
                </div>
                <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                  <button type="submit" className="admin-btn admin-btn--primary">Create School</button>
                  <button type="button" className="admin-btn admin-btn--secondary" onClick={() => setShowCreate(false)}>Cancel</button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* -------- Schools Table -------- */}
        <div className="admin-section">
          <div className="admin-toolbar">
            <h3 className="admin-section-title" style={{ margin: 0 }}>All Schools</h3>
            <span className="admin-toolbar__count">{schools.length} schools</span>
          </div>

          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>School Name</th>
                  <th>Address</th>
                  <th>Principal</th>
                  <th>Status</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {schools.map((school) => (
                  <tr key={school._id}>
                    <td className="bold">{school.name}</td>
                    <td>{school.address || "—"}</td>
                    <td>
                      {school.principalId ? (
                        <div>
                          <div style={{ fontWeight: 600, color: "#1e293b" }}>{school.principalId.name}</div>
                          <div style={{ fontSize: "0.75rem", color: "#64748b" }}>{school.principalId.email}</div>
                        </div>
                      ) : (
                        <span style={{ color: "#94a3b8", fontStyle: "italic" }}>Unassigned</span>
                      )}
                    </td>
                    <td>
                      <span className={`admin-status-badge admin-status-badge--${school.status || "active"}`}>
                        {school.status || "active"}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "flex", gap: 4, justifyContent: "flex-end" }}>
                        <button
                          className="admin-btn admin-btn--sm admin-btn--secondary"
                          onClick={() => openAssign(school._id)}
                          title="Assign Principal"
                        >
                          <UserPlus style={{ width: 14, height: 14 }} />
                          {school.principalId ? "Reassign" : "Assign"}
                        </button>
                        <button
                          className="admin-btn--icon"
                          onClick={() => openEdit(school)}
                          title="Edit School"
                        >
                          <Pencil style={{ width: 16, height: 16 }} />
                        </button>
                        <button
                          className="admin-btn--icon admin-btn--icon-danger"
                          onClick={() => handleDelete(school._id)}
                          title="Deactivate School"
                        >
                          <Trash2 style={{ width: 16, height: 16 }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!loading && schools.length === 0 && (
                  <tr>
                    <td colSpan="5" className="admin-empty">No schools found. Create one above.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* -------- Edit School Modal -------- */}
        {editSchool && (
          <div className="admin-modal-overlay" onClick={() => setEditSchool(null)}>
            <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
              <button className="admin-modal__close" onClick={() => setEditSchool(null)}>
                <X style={{ width: 20, height: 20 }} />
              </button>
              <h3>Edit School</h3>
              <p>Update school details below.</p>
              {error && <div className="admin-alert admin-alert--error">{error}</div>}
              <form onSubmit={handleEdit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div className="admin-form-group">
                  <label className="admin-label">School Name</label>
                  <input
                    className="admin-input"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    required
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-label">Address</label>
                  <input
                    className="admin-input"
                    value={editAddress}
                    onChange={(e) => setEditAddress(e.target.value)}
                  />
                </div>
                <button type="submit" className="admin-btn admin-btn--primary" style={{ marginTop: 6 }}>
                  Save Changes
                </button>
              </form>
            </div>
          </div>
        )}

        {/* -------- Assign Principal Modal -------- */}
        {assignSchoolId && (
          <div className="admin-modal-overlay" onClick={() => setAssignSchoolId(null)}>
            <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
              <button className="admin-modal__close" onClick={() => setAssignSchoolId(null)}>
                <X style={{ width: 20, height: 20 }} />
              </button>
              <h3>Create & Assign Principal</h3>
              <p>This creates a new principal account with a temporary password.</p>
              {error && <div className="admin-alert admin-alert--error">{error}</div>}
              <form onSubmit={handleAssign} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div className="admin-form-group">
                  <label className="admin-label">Full Name</label>
                  <input
                    className="admin-input"
                    value={principalName}
                    onChange={(e) => setPrincipalName(e.target.value)}
                    placeholder="e.g. Dr. Sharma"
                    required
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-label">Email</label>
                  <input
                    type="email"
                    className="admin-input"
                    value={principalEmail}
                    onChange={(e) => setPrincipalEmail(e.target.value)}
                    placeholder="principal@school.edu"
                    required
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-label">Temporary Password</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={principalPassword}
                    onChange={(e) => setPrincipalPassword(e.target.value)}
                    placeholder="temp1234"
                    required
                    style={{ fontFamily: "monospace" }}
                  />
                </div>
                <button type="submit" className="admin-btn admin-btn--primary" style={{ marginTop: 6 }}>
                  Create Principal Account
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
