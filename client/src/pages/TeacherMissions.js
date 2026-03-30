import React, { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Map, Users, Star } from "lucide-react";
import TeacherShell from "../components/TeacherShell";
import { apiRequest } from "../api/httpClient";

export default function TeacherMissions() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    whyItMatters: "",
    points: 10,
    difficulty: 2,
    deadline: "",
    proofType: "any",
    targetClass: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchMyTasks();
  }, []);

  const fetchMyTasks = async () => {
    try {
      setLoading(true);
      const data = await apiRequest("/api/tasks/my");
      setTasks(data || []);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage("");

    try {
      await apiRequest("/api/tasks/create", {
        method: "POST",
        body: formData,
        retries: 0,
      });
      setMessage("Mission successfully created! 🌱");
      setFormData({
        title: "",
        description: "",
        whyItMatters: "",
        points: 10,
        difficulty: 2,
        deadline: "",
        proofType: "any",
        targetClass: "",
      });
      setIsCreating(false);
      fetchMyTasks();
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage(err.message || "Failed to create mission.");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredTasks = useMemo(() => {
    if (!search) return tasks;
    return tasks.filter(t => 
      t.title.toLowerCase().includes(search.toLowerCase()) || 
      (t.targetClass || "All Classes").toLowerCase().includes(search.toLowerCase())
    );
  }, [tasks, search]);

  return (
    <TeacherShell 
      title="Missions Management" 
      subtitle="Create, assign, and track eco-missions for your students." 
      onSearch={setSearch}
      headerAction={
        <button
          onClick={() => setIsCreating(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 transition"
        >
          <Plus className="w-4 h-4" /> New Mission
        </button>
      }
    >
      {message && (
        <div className="mb-4 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-800 font-semibold shadow-sm">
          {message}
        </div>
      )}

      {/* Creation Modal / Inline Form */}
      <AnimatePresence>
        {isCreating && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 overflow-hidden"
          >
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 relative">
              <button 
                onClick={() => setIsCreating(false)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-slate-500 transition"
              >
                <X className="w-5 h-5" />
              </button>
              
              <h2 className="text-xl font-display font-bold text-slate-800 mb-6 flex items-center gap-2">
                <Map className="w-6 h-6 text-emerald-600" />
                Draft New Mission
              </h2>

              <form onSubmit={handleCreate} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Mission Title</label>
                    <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full rounded-xl border-slate-200 focus:ring-emerald-500 focus:border-emerald-500 p-2.5 bg-slate-50 border" placeholder="e.g. Park Cleanup" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Target Class <span className="text-slate-400 font-normal">(Optional)</span></label>
                    <input value={formData.targetClass} onChange={e => setFormData({...formData, targetClass: e.target.value})} className="w-full rounded-xl border-slate-200 focus:ring-emerald-500 focus:border-emerald-500 p-2.5 bg-slate-50 border" placeholder="e.g. 10-A or leave blank for all" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Description (What to do)</label>
                  <textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows={2} className="w-full rounded-xl flex-grow border-slate-200 focus:ring-emerald-500 focus:border-emerald-500 p-2.5 bg-slate-50 border resize-none" placeholder="Provide instructions..."></textarea>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Why It Matters (Educational Value)</label>
                  <textarea required value={formData.whyItMatters} onChange={e => setFormData({...formData, whyItMatters: e.target.value})} rows={2} className="w-full flex-grow rounded-xl border-slate-200 focus:ring-emerald-500 focus:border-emerald-500 p-2.5 bg-slate-50 border resize-none" placeholder="Explain the environmental impact..."></textarea>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">XP Reward</label>
                    <input required type="number" min="0" value={formData.points} onChange={e => setFormData({...formData, points: Number(e.target.value)})} className="w-full rounded-xl border-slate-200 focus:ring-emerald-500 focus:border-emerald-500 p-2.5 bg-slate-50 border" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Difficulty (1-5)</label>
                    <select value={formData.difficulty} onChange={e => setFormData({...formData, difficulty: Number(e.target.value)})} className="w-full rounded-xl border-slate-200 focus:ring-emerald-500 focus:border-emerald-500 p-2.5 bg-slate-50 border">
                      <option value="1">1 - Very Easy</option>
                      <option value="2">2 - Easy</option>
                      <option value="3">3 - Medium</option>
                      <option value="4">4 - Hard</option>
                      <option value="5">5 - Epic</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Proof Type</label>
                    <select value={formData.proofType} onChange={e => setFormData({...formData, proofType: e.target.value})} className="w-full rounded-xl border-slate-200 focus:ring-emerald-500 focus:border-emerald-500 p-2.5 bg-slate-50 border">
                      <option value="any">Any (Text/Image/Video)</option>
                      <option value="image">Image (Photo)</option>
                      <option value="video">Short Video</option>
                      <option value="text">Text Only</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Deadline <span className="text-slate-400 font-normal">(Opt)</span></label>
                    <input type="date" value={formData.deadline} onChange={e => setFormData({...formData, deadline: e.target.value})} className="w-full rounded-xl border-slate-200 focus:ring-emerald-500 focus:border-emerald-500 p-2.5 bg-slate-50 border" />
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button disabled={submitting} type="submit" className="px-6 py-3 rounded-xl bg-gray-900 text-white font-bold hover:bg-emerald-600 transition shadow-sm disabled:opacity-50">
                    {submitting ? "Assigning..." : "Assign Mission"}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Missions List */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#f8fafc] text-slate-600 border-b border-slate-200">
              <tr>
                <th className="text-left p-4 font-semibold">Mission Details</th>
                <th className="text-left p-4 font-semibold">Assigned To</th>
                <th className="text-center p-4 font-semibold">Proof Type</th>
                <th className="text-center p-4 font-semibold">Reward</th>
                <th className="text-right p-4 font-semibold">Deadline</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" className="p-8 text-center text-slate-500">Loading missions...</td></tr>
              ) : filteredTasks.length === 0 ? (
                <tr><td colSpan="5" className="p-8 text-center text-slate-500">No missions found. Click 'New Mission' to get started!</td></tr>
              ) : (
                filteredTasks.map((t) => (
                  <tr key={t._id} className="border-b border-slate-100 hover:bg-[#fcfdfd] transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-slate-800 text-base">{t.title}</div>
                      <div className="text-slate-500 text-xs mt-1 w-64 truncate">{t.description}</div>
                    </td>
                    <td className="p-4">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
                        <Users className="w-3.5 h-3.5 opacity-70" /> {t.targetClass || "All Classes"}
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <span className="capitalize font-semibold text-slate-600">{t.proofType || "Any"}</span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="inline-flex items-center gap-1 font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-lg">
                        <Star className="w-3.5 h-3.5 fill-amber-500" /> {t.points}
                      </div>
                    </td>
                    <td className="p-4 text-right text-slate-500 font-medium">
                      {t.deadline ? new Date(t.deadline).toLocaleDateString() : "No Deadline"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </TeacherShell>
  );
}
