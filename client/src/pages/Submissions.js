import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FolderOpen, MapPin, Paperclip, Calendar, ArrowLeft } from "lucide-react";
import { IconBox } from "../components";
import { apiRequest, API_BASE_URL } from "../api/httpClient";

function Submissions() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    apiRequest("/api/submissions/my")
      .then((d) => setSubmissions(d || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display font-bold text-2xl text-eco-primary flex items-center gap-2">
            <IconBox color="blue" size="sm"><FolderOpen className="w-5 h-5" strokeWidth={2} /></IconBox>
            My Submissions
          </h1>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/dashboard")}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-eco-primary text-white font-semibold"
          >
            <ArrowLeft className="w-4 h-4" /> Dashboard
          </motion.button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="w-12 h-12 border-4 border-eco-primary border-t-transparent rounded-full" />
          </div>
        ) : submissions.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl shadow-card">
            <IconBox color="green" size="lg" className="mx-auto mb-3 rounded-2xl w-16 h-16 flex items-center justify-center">
              <MapPin className="w-10 h-10" strokeWidth={2} />
            </IconBox>
            <p className="text-gray-500">No submissions yet. Complete tasks to see them here!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {submissions.map((sub, i) => (
              <motion.div
                key={sub._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-3xl p-6 shadow-card border-2 border-eco-pale"
              >
                <h3 className="font-display font-bold text-lg text-gray-800 mb-2 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-eco-primary" strokeWidth={2} />
                  {sub.task?.title || "Task"}
                </h3>
                <p className="text-gray-600 mb-2">{sub.content || sub.text || "—"}</p>
                {(sub.imageUrl || sub.file) && (
                  <a
                    href={sub.imageUrl || `${API_BASE_URL}/${sub.file}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-eco-primary font-semibold"
                  >
                    <Paperclip className="w-4 h-4" /> View proof
                  </a>
                )}
                <p className="text-sm text-gray-500 mt-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> {new Date(sub.createdAt).toLocaleString()} • {sub.status || "—"}
                </p>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Submissions;
