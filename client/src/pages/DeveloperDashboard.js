import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, School as SchoolIcon, Users, Plus, Trash2, UserPlus, X } from "lucide-react";
import { apiRequest } from "../api/httpClient";
import { clearAuth } from "../utils/authStorage";
import { useAlert } from "../components/ui/AlertProvider";

export default function DeveloperDashboard() {
  const [schools, setSchools] = useState([]);
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState("schools"); // schools, users
  const navigate = useNavigate();
  const { showAlert } = useAlert();

  // New School Form
  const [schoolName, setSchoolName] = useState("");
  const [schoolAddress, setSchoolAddress] = useState("");

  // Assign Principal form
  const [assignSchoolId, setAssignSchoolId] = useState(null);
  const [principalName, setPrincipalName] = useState("");
  const [principalEmail, setPrincipalEmail] = useState("");
  const [principalPassword, setPrincipalPassword] = useState("");
  const [assignError, setAssignError] = useState("");
  const [assignSuccess, setAssignSuccess] = useState("");

  useEffect(() => {
    fetchSchools();
    fetchUsers();
  }, []);

  const fetchSchools = async () => {
    try {
      const data = await apiRequest("/api/admin/schools");
      setSchools(data.schools || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUsers = async () => {
    try {
      const data = await apiRequest("/api/admin/users");
      setUsers(data.users || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateSchool = async (e) => {
    e.preventDefault();
    try {
      if (!schoolName) return;
      await apiRequest("/api/admin/schools", "POST", { name: schoolName, address: schoolAddress });
      setSchoolName("");
      setSchoolAddress("");
      fetchSchools();
      showAlert({ type: "success", message: "School created successfully!" });
    } catch (err) {
      showAlert({ type: "error", message: "Failed to create school" });
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await apiRequest(`/api/admin/users/${id}`, "DELETE");
      fetchUsers();
      showAlert({ type: "success", message: "User deleted" });
    } catch (err) {
      showAlert({ type: "error", message: "Failed to delete user" });
    }
  };

  const openAssignForm = (schoolId) => {
    setAssignSchoolId(schoolId);
    setPrincipalName("");
    setPrincipalEmail("");
    setPrincipalPassword("");
    setAssignError("");
    setAssignSuccess("");
  };

  const handleAssignPrincipal = async (e) => {
    e.preventDefault();
    setAssignError("");
    setAssignSuccess("");
    try {
      await apiRequest("/api/admin/schools/assign", "POST", {
        schoolId: assignSchoolId,
        name: principalName,
        email: principalEmail,
        password: principalPassword,
      });
      setAssignSuccess(`Principal "${principalName}" created and assigned successfully!`);
      setPrincipalName("");
      setPrincipalEmail("");
      setPrincipalPassword("");
      fetchSchools();
      setTimeout(() => setAssignSchoolId(null), 2000);
    } catch (err) {
      setAssignError(err.message || "Failed to assign principal.");
    }
  };

  const handleLogout = () => {
    clearAuth();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-100 font-body flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-6">
          <h2 className="font-display font-bold text-xl uppercase tracking-wider text-slate-300">
            Dev Console
          </h2>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          <button
            onClick={() => setActiveTab("schools")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-colors ${
              activeTab === "schools" ? "bg-slate-800 text-emerald-400" : "text-slate-400 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <SchoolIcon className="w-5 h-5" />
            Schools
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-colors ${
              activeTab === "users" ? "bg-slate-800 text-emerald-400" : "text-slate-400 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <Users className="w-5 h-5" />
            Users
          </button>
        </nav>
        <div className="p-4">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-slate-400 hover:text-white w-full px-4 py-3 text-sm font-semibold transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        {activeTab === "schools" && (
          <div>
            <h1 className="font-display font-bold text-2xl text-slate-800 mb-6">Manage Schools</h1>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-8 max-w-2xl">
              <h2 className="font-semibold text-slate-700 mb-4 flex items-center gap-2">
                <Plus className="w-4 h-4" /> Add New School
              </h2>
              <form onSubmit={handleCreateSchool} className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">School Name</label>
                  <input
                    className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-slate-900 outline-none"
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                    placeholder="Enter school name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Address</label>
                  <input
                    className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-slate-900 outline-none"
                    value={schoolAddress}
                    onChange={(e) => setSchoolAddress(e.target.value)}
                    placeholder="Enter school address"
                  />
                </div>
                <button type="submit" className="bg-slate-900 text-white font-bold py-2.5 rounded-lg hover:bg-slate-800 mt-2">
                  Create School
                </button>
              </form>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-6 py-4 font-bold">School Name</th>
                    <th className="px-6 py-4 font-bold">Address</th>
                    <th className="px-6 py-4 font-bold">Principal</th>
                    <th className="px-6 py-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {schools.map(school => (
                    <tr key={school._id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 font-semibold text-slate-900">{school.name}</td>
                      <td className="px-6 py-4">{school.address || "N/A"}</td>
                      <td className="px-6 py-4">
                        {school.principalId ? (
                          <div className="flex flex-col">
                            <span className="font-semibold text-slate-800">{school.principalId.name}</span>
                            <span className="text-xs text-slate-500">{school.principalId.email}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Unassigned</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => openAssignForm(school._id)}
                          className="text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-md flex items-center gap-1 ml-auto"
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                          {school.principalId ? "Reassign" : "Assign Principal"}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {schools.length === 0 && (
                    <tr><td colSpan="4" className="px-6 py-8 text-center text-slate-400">No schools found</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Assign Principal Modal */}
            {assignSchoolId && (
              <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative">
                  <button onClick={() => setAssignSchoolId(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
                    <X className="w-5 h-5" />
                  </button>
                  <h3 className="font-display font-bold text-lg text-slate-800 mb-1 flex items-center gap-2">
                    <UserPlus className="w-5 h-5 text-purple-500" /> Create & Assign Principal
                  </h3>
                  <p className="text-sm text-slate-500 mb-5">This will create a new principal account with a temporary password.</p>
                  
                  {assignError && <div className="bg-red-50 border border-red-200 text-red-800 text-sm rounded-xl px-4 py-2.5 mb-4">{assignError}</div>}
                  {assignSuccess && <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded-xl px-4 py-2.5 mb-4">{assignSuccess}</div>}

                  <form onSubmit={handleAssignPrincipal} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Full Name</label>
                      <input className="w-full border border-slate-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-purple-500 outline-none" value={principalName} onChange={e => setPrincipalName(e.target.value)} placeholder="e.g. Dr. Sharma" required />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Email</label>
                      <input type="email" className="w-full border border-slate-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-purple-500 outline-none" value={principalEmail} onChange={e => setPrincipalEmail(e.target.value)} placeholder="principal@school.edu" required />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Temporary Password</label>
                      <input type="text" className="w-full border border-slate-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-purple-500 outline-none font-mono" value={principalPassword} onChange={e => setPrincipalPassword(e.target.value)} placeholder="temp1234" required />
                    </div>
                    <button type="submit" className="w-full bg-purple-600 text-white font-bold py-2.5 rounded-lg hover:bg-purple-700 transition-colors">
                      Create Principal Account
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "users" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h1 className="font-display font-bold text-2xl text-slate-800">Manage Users</h1>
              <span className="bg-slate-200 text-slate-700 px-3 py-1 rounded-full text-xs font-bold">
                {users.length} Total Users
              </span>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-6 py-4 font-bold">Name</th>
                    <th className="px-6 py-4 font-bold">Email</th>
                    <th className="px-6 py-4 font-bold">Role</th>
                    <th className="px-6 py-4 font-bold">ID</th>
                    <th className="px-6 py-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map(u => (
                    <tr key={u._id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 font-semibold text-slate-900">{u.name}</td>
                      <td className="px-6 py-4">{u.email}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${
                          u.role === 'admin' ? "bg-red-100 text-red-700" :
                          u.role === 'principal' ? "bg-purple-100 text-purple-700" :
                          u.role === 'teacher' ? "bg-blue-100 text-blue-700" :
                          "bg-emerald-100 text-emerald-700"
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-slate-400">{u._id}</td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => handleDeleteUser(u._id)}
                          className="text-slate-400 hover:text-red-500 transition-colors p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr><td colSpan="5" className="px-6 py-8 text-center text-slate-400">No users found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
